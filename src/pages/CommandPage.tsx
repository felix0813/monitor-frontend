import React, { useMemo, useState } from "react";

type CommandTemplate = {
    id: string;
    name: string;
    description?: string;
    content: string;
};

type ExecuteResponse = {
    success: boolean;
    output?: string;
    error?: string;
};

const TEMPLATE_LIST: CommandTemplate[] = [
    {
        id: "1",
        name: "查看日志",
        description: "按关键字筛选最近日志",
        content: "tail -n {{lines}} /var/log/{{fileName}} | grep '{{keyword}}'",
    },
    {
        id: "2",
        name: "重启服务",
        description: "重启指定服务并查看状态",
        content: "systemctl restart {{serviceName}} && systemctl status {{serviceName}}",
    },
    {
        id: "3",
        name: "发布命令",
        description: "拉取代码并构建发布",
        content: "cd {{projectPath}} && git pull && npm install && npm run build",
    },
];

const VARIABLE_REG = /{{\s*([a-zA-Z0-9_-\u4e00-\u9fa5]+)\s*}}/g;

function extractVariables(template: string) {
    const vars: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = VARIABLE_REG.exec(template)) !== null) {
        const key = match[1];
        if (!vars.includes(key)) {
            vars.push(key);
        }
    }

    return vars;
}

function buildCommand(template: string, values: Record<string, string>) {
    return template.replace(VARIABLE_REG, (_, key: string) => values[key] ?? "");
}

async function executeCommand(command: string): Promise<ExecuteResponse> {
    const res = await fetch("/api/command/execute", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ command }),
    });

    if (!res.ok) {
        return {
            success: false,
            error: `请求失败: ${res.status}`,
        };
    }

    return res.json();
}

export default function CommandPage() {
    const [templates] = useState<CommandTemplate[]>(TEMPLATE_LIST);
    const [selectedTemplate, setSelectedTemplate] = useState<CommandTemplate | null>(null);
    const [mode, setMode] = useState<"edit" | "vars" | null>(null);
    const [showModeDialog, setShowModeDialog] = useState(false);

    const [editorValue, setEditorValue] = useState("");
    const [variableValues, setVariableValues] = useState<Record<string, string>>({});
    const [executing, setExecuting] = useState(false);
    const [executeResult, setExecuteResult] = useState("");
    const [executeError, setExecuteError] = useState("");

    const variableKeys = useMemo(() => {
        if (!selectedTemplate) return [];
        return extractVariables(selectedTemplate.content);
    }, [selectedTemplate]);

    const generatedCommand = useMemo(() => {
        if (!selectedTemplate || mode !== "vars") return "";
        return buildCommand(selectedTemplate.content, variableValues);
    }, [selectedTemplate, mode, variableValues]);

    const finalCommand = mode === "edit" ? editorValue : generatedCommand;

    const handleTemplateClick = (template: CommandTemplate) => {
        setSelectedTemplate(template);
        setMode(null);
        setEditorValue("");
        setVariableValues({});
        setExecuteResult("");
        setExecuteError("");
        setShowModeDialog(true);
    };

    const handleChooseEdit = () => {
        if (!selectedTemplate) return;
        setMode("edit");
        setEditorValue(selectedTemplate.content);
        setVariableValues({});
        setShowModeDialog(false);
    };

    const handleChooseVars = () => {
        if (!selectedTemplate) return;

        const initialValues: Record<string, string> = {};
        extractVariables(selectedTemplate.content).forEach((key) => {
            initialValues[key] = "";
        });

        setMode("vars");
        setVariableValues(initialValues);
        setEditorValue("");
        setShowModeDialog(false);
    };

    const handleVariableChange = (key: string, value: string) => {
        setVariableValues((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleExecute = async () => {
        if (!finalCommand.trim()) {
            setExecuteError("命令不能为空");
            setExecuteResult("");
            return;
        }

        setExecuting(true);
        setExecuteError("");
        setExecuteResult("");

        try {
            const result = await executeCommand(finalCommand);
            if (result.success) {
                setExecuteResult(result.output || "执行成功");
            } else {
                setExecuteError(result.error || "执行失败");
            }
        } catch (error) {
            setExecuteError(error instanceof Error ? error.message : "执行异常");
        } finally {
            setExecuting(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>命令模板</div>
                <div style={styles.templateList}>
                    {templates.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => handleTemplateClick(item)}
                            style={{
                                ...styles.templateItem,
                                ...(selectedTemplate?.id === item.id ? styles.templateItemActive : {}),
                            }}
                        >
                            <div style={styles.templateName}>{item.name}</div>
                            {item.description ? (
                                <div style={styles.templateDesc}>{item.description}</div>
                            ) : null}
                        </button>
                    ))}
                </div>
            </div>

            <div style={styles.content}>
                <div style={styles.contentHeader}>
                    <div>
                        <div style={styles.title}>命令编辑与执行</div>
                        <div style={styles.subtitle}>
                            {selectedTemplate
                                ? `当前模板：${selectedTemplate.name}`
                                : "请先从左侧选择一个模板"}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleExecute}
                        disabled={executing || !finalCommand.trim()}
                        style={{
                            ...styles.executeButton,
                            ...(executing || !finalCommand.trim() ? styles.disabledButton : {}),
                        }}
                    >
                        {executing ? "执行中..." : "执行命令"}
                    </button>
                </div>

                {!selectedTemplate && (
                    <div style={styles.emptyState}>选择左侧模板后开始操作</div>
                )}

                {selectedTemplate && mode === "edit" && (
                    <div style={styles.panel}>
                        <div style={styles.panelTitle}>直接编辑命令</div>
                        <textarea
                            value={editorValue}
                            onChange={(e) => setEditorValue(e.target.value)}
                            style={styles.codeEditor}
                            placeholder="在这里直接编辑命令"
                        />
                    </div>
                )}

                {selectedTemplate && mode === "vars" && (
                    <div style={styles.panel}>
                        <div style={styles.panelTitle}>填写变量</div>

                        <div style={styles.variableGrid}>
                            {variableKeys.map((key) => (
                                <div key={key} style={styles.variableCard}>
                                    <label style={styles.variableLabel}>{key}</label>
                                    <textarea
                                        value={variableValues[key] || ""}
                                        onChange={(e) => handleVariableChange(key, e.target.value)}
                                        style={styles.variableTextarea}
                                        placeholder={`请输入变量 ${key}`}
                                    />
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 20 }}>
                            <div style={styles.panelTitle}>生成后的命令</div>
                            <textarea
                                value={generatedCommand}
                                readOnly
                                style={{
                                    ...styles.codeEditor,
                                    background: "#f7f7f7",
                                }}
                            />
                        </div>
                    </div>
                )}

                {(executeResult || executeError) && (
                    <div style={styles.resultPanel}>
                        <div style={styles.panelTitle}>执行结果</div>
                        <pre
                            style={{
                                ...styles.resultBox,
                                color: executeError ? "#b42318" : "#0f5132",
                                background: executeError ? "#fef3f2" : "#ecfdf3",
                                borderColor: executeError ? "#fecdca" : "#abefc6",
                            }}
                        >
              {executeError || executeResult}
            </pre>
                    </div>
                )}
            </div>

            {showModeDialog && selectedTemplate && (
                <div style={styles.modalMask}>
                    <div style={styles.modal}>
                        <div style={styles.modalTitle}>选择使用方式</div>
                        <div style={styles.modalText}>
                            你选择了“{selectedTemplate.name}”，请指定是直接编辑命令，还是先填写变量。
                        </div>
                        <div style={styles.modalActions}>
                            <button type="button" onClick={handleChooseEdit} style={styles.secondaryButton}>
                                直接编辑
                            </button>
                            <button type="button" onClick={handleChooseVars} style={styles.primaryButton}>
                                填写变量
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        display: "flex",
        height: "100vh",
        background: "#f5f7fb",
        color: "#1f2937",
        fontFamily: "Segoe UI, PingFang SC, Microsoft YaHei, sans-serif",
    },
    sidebar: {
        width: 280,
        borderRight: "1px solid #e5e7eb",
        background: "#ffffff",
        padding: 20,
        boxSizing: "border-box",
    },
    sidebarHeader: {
        fontSize: 18,
        fontWeight: 700,
        marginBottom: 16,
    },
    templateList: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    templateItem: {
        textAlign: "left",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        background: "#fff",
        padding: 14,
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    templateItemActive: {
        borderColor: "#1677ff",
        background: "#eff6ff",
    },
    templateName: {
        fontSize: 15,
        fontWeight: 600,
        marginBottom: 6,
    },
    templateDesc: {
        fontSize: 13,
        color: "#6b7280",
        lineHeight: 1.5,
    },
    content: {
        flex: 1,
        padding: 24,
        boxSizing: "border-box",
        overflow: "auto",
    },
    contentHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        gap: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 700,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: "#6b7280",
    },
    executeButton: {
        height: 40,
        padding: "0 18px",
        border: "none",
        borderRadius: 10,
        background: "#1677ff",
        color: "#fff",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 600,
    },
    disabledButton: {
        opacity: 0.6,
        cursor: "not-allowed",
    },
    emptyState: {
        height: 240,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px dashed #d1d5db",
        borderRadius: 16,
        color: "#6b7280",
        background: "#fff",
    },
    panel: {
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #e5e7eb",
        padding: 20,
    },
    panelTitle: {
        fontSize: 15,
        fontWeight: 600,
        marginBottom: 12,
    },
    codeEditor: {
        width: "100%",
        minHeight: 260,
        border: "1px solid #d1d5db",
        borderRadius: 12,
        padding: 14,
        fontSize: 14,
        lineHeight: 1.6,
        resize: "vertical",
        boxSizing: "border-box",
        fontFamily: "Consolas, Monaco, monospace",
        outline: "none",
    },
    variableGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 16,
    },
    variableCard: {
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 14,
        background: "#fafafa",
    },
    variableLabel: {
        display: "block",
        fontSize: 14,
        fontWeight: 600,
        marginBottom: 8,
    },
    variableTextarea: {
        width: "100%",
        minHeight: 110,
        border: "1px solid #d1d5db",
        borderRadius: 10,
        padding: 10,
        fontSize: 14,
        lineHeight: 1.6,
        resize: "vertical",
        boxSizing: "border-box",
        outline: "none",
    },
    resultPanel: {
        marginTop: 20,
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #e5e7eb",
        padding: 20,
    },
    resultBox: {
        margin: 0,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        border: "1px solid",
        borderRadius: 12,
        padding: 14,
        fontSize: 13,
        lineHeight: 1.6,
    },
    modalMask: {
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
    },
    modal: {
        width: 420,
        background: "#fff",
        borderRadius: 16,
        padding: 24,
        boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 700,
        marginBottom: 10,
    },
    modalText: {
        fontSize: 14,
        color: "#4b5563",
        lineHeight: 1.7,
        marginBottom: 20,
    },
    modalActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: 12,
    },
    primaryButton: {
        border: "none",
        borderRadius: 10,
        background: "#1677ff",
        color: "#fff",
        padding: "10px 16px",
        cursor: "pointer",
        fontWeight: 600,
    },
    secondaryButton: {
        border: "1px solid #d1d5db",
        borderRadius: 10,
        background: "#fff",
        color: "#111827",
        padding: "10px 16px",
        cursor: "pointer",
        fontWeight: 600,
    },
};
