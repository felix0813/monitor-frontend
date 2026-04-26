import {useMemo, useState} from 'react';
import '../styles/command.css';

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

const templates: CommandTemplate[] = [
  {
    id: '1',
    name: '查看日志',
    description: '按关键字筛选最近日志，适合快速定位线上问题。',
    content: "tail -n {{lines}} /var/log/{{fileName}} | grep '{{keyword}}'",
  },
  {
    id: '2',
    name: '重启服务',
    description: '重启指定服务，并立即查看当前运行状态。',
    content: 'systemctl restart {{serviceName}} && systemctl status {{serviceName}}',
  },
  {
    id: '3',
    name: '发布命令',
    description: '进入项目目录后拉取代码、安装依赖并执行构建。',
    content: 'cd {{projectPath}} && git pull && npm install && npm run build',
  },
];

const variablePattern = /{{\s*([a-zA-Z0-9_-\u4e00-\u9fa5]+)\s*}}/g;

function extractVariables(template: string) {
  const variableNames: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = variablePattern.exec(template)) !== null) {
    const key = match[1];
    if (!variableNames.includes(key)) {
      variableNames.push(key);
    }
  }

  return variableNames;
}

function buildCommand(template: string, values: Record<string, string>) {
  return template.replace(variablePattern, (_, key: string) => values[key] ?? '');
}

async function executeCommand(command: string): Promise<ExecuteResponse> {
  const response = await fetch('/api/command/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({command}),
  });

  if (!response.ok) {
    return {
      success: false,
      error: `请求失败: ${response.status}`,
    };
  }

  return response.json();
}

function CommandPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<CommandTemplate | null>(null);
  const [mode, setMode] = useState<'edit' | 'vars' | null>(null);
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [editorValue, setEditorValue] = useState('');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [executing, setExecuting] = useState(false);
  const [executeResult, setExecuteResult] = useState('');
  const [executeError, setExecuteError] = useState('');

  const variableKeys = useMemo(() => {
    if (!selectedTemplate) {
      return [];
    }

    return extractVariables(selectedTemplate.content);
  }, [selectedTemplate]);

  const generatedCommand = useMemo(() => {
    if (!selectedTemplate || mode !== 'vars') {
      return '';
    }

    return buildCommand(selectedTemplate.content, variableValues);
  }, [mode, selectedTemplate, variableValues]);

  const finalCommand = mode === 'edit' ? editorValue : generatedCommand;

  const resetExecutionState = () => {
    setExecuteResult('');
    setExecuteError('');
  };

  const handleTemplateClick = (template: CommandTemplate) => {
    setSelectedTemplate(template);
    setMode(null);
    setEditorValue('');
    setVariableValues({});
    resetExecutionState();
    setShowModeDialog(true);
  };

  const handleChooseEdit = () => {
    if (!selectedTemplate) {
      return;
    }

    setMode('edit');
    setEditorValue(selectedTemplate.content);
    setVariableValues({});
    setShowModeDialog(false);
  };

  const handleChooseVars = () => {
    if (!selectedTemplate) {
      return;
    }

    const initialValues = extractVariables(selectedTemplate.content).reduce<Record<string, string>>(
      (result, key) => {
        result[key] = '';
        return result;
      },
      {},
    );

    setMode('vars');
    setVariableValues(initialValues);
    setEditorValue('');
    setShowModeDialog(false);
  };

  const handleVariableChange = (key: string, value: string) => {
    setVariableValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleExecute = async () => {
    if (!finalCommand.trim()) {
      setExecuteError('命令不能为空');
      setExecuteResult('');
      return;
    }

    setExecuting(true);
    resetExecutionState();

    try {
      const result = await executeCommand(finalCommand);
      if (result.success) {
        setExecuteResult(result.output || '执行成功');
        return;
      }

      setExecuteError(result.error || '执行失败');
    } catch (error) {
      setExecuteError(error instanceof Error ? error.message : '执行异常');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <section className="command-page">
      <header className="command-hero">
        <div className="command-hero-copy">
          <p className="command-kicker">Workspace Command</p>
          <h2>命令模板与执行面板</h2>
          <p className="command-description">
            从常用模板开始，按需直接修改命令或填写变量后生成命令，统一在这里执行并查看结果。
          </p>

          <div className="command-hero-actions">
            <button
              type="button"
              className="command-primary-button"
              onClick={handleExecute}
              disabled={executing || !finalCommand.trim()}
            >
              {executing ? '执行中...' : '执行命令'}
            </button>
            <span className="command-hero-hint">
              {selectedTemplate ? `当前模板：${selectedTemplate.name}` : '先选择左侧模板开始操作'}
            </span>
          </div>
        </div>

        <div className="command-summary-card">
          <span className="command-summary-badge">Command</span>
          <strong>{templates.length}</strong>
          <p>当前内置 {templates.length} 个常用命令模板，覆盖日志查询、服务重启和基础发布场景。</p>

          <div className="command-summary-meta">
            <span>{mode === 'edit' ? '直接编辑' : mode === 'vars' ? '变量填充' : '待选择模式'}</span>
            <span>{variableKeys.length > 0 ? `${variableKeys.length} 个变量` : '无变量'}</span>
          </div>
        </div>
      </header>

      <section className="command-content-grid">
        <aside className="command-panel command-sidebar">
          <div className="command-panel-head">
            <div>
              <p className="command-panel-kicker">Template List</p>
              <h3>命令模板</h3>
            </div>
            <span className="command-panel-meta">{templates.length} 个模板</span>
          </div>

          <div className="command-template-list">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                className={
                  selectedTemplate?.id === template.id
                    ? 'command-template-card command-template-card-active'
                    : 'command-template-card'
                }
                onClick={() => handleTemplateClick(template)}
              >
                <div className="command-template-card-top">
                  <h4>{template.name}</h4>
                  <span>{extractVariables(template.content).length} 个变量</span>
                </div>
                <p>{template.description || '暂无模板说明。'}</p>
                <code>{template.content}</code>
              </button>
            ))}
          </div>
        </aside>

        <div className="command-main-column">
          {!selectedTemplate ? (
            <section className="command-panel command-empty-state">
              <h3>选择一个模板后开始配置</h3>
              <p>支持直接编辑命令，或先填写变量再生成最终命令。</p>
            </section>
          ) : (
            <>
              <section className="command-panel">
                <div className="command-panel-head">
                  <div>
                    <p className="command-panel-kicker">Template Detail</p>
                    <h3>{selectedTemplate.name}</h3>
                  </div>
                  <span className="command-panel-meta">
                    {mode === 'edit' ? '直接编辑模式' : mode === 'vars' ? '变量填充模式' : '请选择模式'}
                  </span>
                </div>

                <p className="command-panel-description">
                  {selectedTemplate.description || '当前模板没有额外说明。'}
                </p>

                {mode === 'edit' ? (
                  <div className="command-editor-section">
                    <label className="command-field">
                      命令内容
                      <textarea
                        value={editorValue}
                        onChange={(event) => setEditorValue(event.target.value)}
                        className="command-code-editor"
                        placeholder="在这里直接编辑命令内容"
                      />
                    </label>
                  </div>
                ) : null}

                {mode === 'vars' ? (
                  <div className="command-editor-section">
                    <div className="command-variable-grid">
                      {variableKeys.map((key) => (
                        <label key={key} className="command-variable-card">
                          <span>{key}</span>
                          <textarea
                            value={variableValues[key] || ''}
                            onChange={(event) => handleVariableChange(key, event.target.value)}
                            placeholder={`请输入 ${key}`}
                          />
                        </label>
                      ))}
                    </div>

                    <label className="command-field">
                      生成后的命令
                      <textarea
                        value={generatedCommand}
                        readOnly
                        className="command-code-editor command-code-editor-readonly"
                      />
                    </label>
                  </div>
                ) : null}

                {mode === null ? (
                  <div className="command-inline-empty">
                    <p>已选择模板，请先决定使用“直接编辑”还是“填写变量”。</p>
                  </div>
                ) : null}
              </section>

              <section className="command-panel">
                <div className="command-panel-head">
                  <div>
                    <p className="command-panel-kicker">Final Command</p>
                    <h3>最终命令预览</h3>
                  </div>
                </div>

                <pre className="command-preview-box">{finalCommand || '当前还没有可执行命令。'}</pre>
              </section>
            </>
          )}

          {(executeResult || executeError) ? (
            <section className="command-panel">
              <div className="command-panel-head">
                <div>
                  <p className="command-panel-kicker">Execute Result</p>
                  <h3>执行结果</h3>
                </div>
              </div>

              <pre
                className={
                  executeError
                    ? 'command-result-box command-result-box-error'
                    : 'command-result-box command-result-box-success'
                }
              >
                {executeError || executeResult}
              </pre>
            </section>
          ) : null}
        </div>
      </section>

      {showModeDialog && selectedTemplate ? (
        <div className="command-modal" onClick={() => setShowModeDialog(false)}>
          <div className="command-modal-panel" onClick={(event) => event.stopPropagation()}>
            <div className="command-modal-header">
              <div>
                <p>Choose Mode</p>
                <h3>选择模板使用方式</h3>
              </div>
              <button
                type="button"
                className="command-secondary-button"
                onClick={() => setShowModeDialog(false)}
              >
                关闭
              </button>
            </div>

            <p className="command-modal-text">
              已选择“{selectedTemplate.name}”，你可以直接编辑完整命令，也可以先填写变量后生成最终命令。
            </p>

            <div className="command-modal-actions">
              <button type="button" className="command-secondary-button" onClick={handleChooseEdit}>
                直接编辑
              </button>
              <button type="button" className="command-primary-button" onClick={handleChooseVars}>
                填写变量
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default CommandPage;
