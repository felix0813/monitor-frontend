import {useEffect, useMemo, useState} from 'react';
import '../styles/command.css';

type ApiCommandTemplate = {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  content: string;
  variables?: string[];
};

type CommandTemplate = {
  id: string;
  name: string;
  description?: string;
  content: string;
  variables?: string[];
};

type ExecuteResponse = {
  success: boolean;
  output?: string;
  error?: string;
};

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

function normalizeTemplate(template: ApiCommandTemplate): CommandTemplate {
  return {
    id: template.id || template._id || '',
    name: template.name,
    description: template.description,
    content: template.content,
    variables: template.variables,
  };
}

function CommandPage() {
  const [templates, setTemplates] = useState<CommandTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templateError, setTemplateError] = useState('');

  const [selectedTemplate, setSelectedTemplate] = useState<CommandTemplate | null>(null);
  const [mode, setMode] = useState<'edit' | 'vars' | null>(null);
  const [showModeDialog, setShowModeDialog] = useState(false);

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateFormError, setTemplateFormError] = useState('');
  const [templateForm, setTemplateForm] = useState({name: '', content: ''});

  const [deletingTemplateId, setDeletingTemplateId] = useState('');

  const [editorValue, setEditorValue] = useState('');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [executing, setExecuting] = useState(false);
  const [executeResult, setExecuteResult] = useState('');
  const [executeError, setExecuteError] = useState('');

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    setTemplateError('');

    try {
      const response = await fetch('/api/command-templates');
      if (!response.ok) {
        throw new Error(`获取模板失败: ${response.status}`);
      }

      const data: ApiCommandTemplate[] = await response.json();
      const normalized = data
        .map(normalizeTemplate)
        .filter((item) => item.id && item.name && item.content);
      setTemplates(normalized);

      setSelectedTemplate((current) => {
        if (!current) {
          return null;
        }
        return normalized.find((item) => item.id === current.id) || null;
      });
    } catch (error) {
      setTemplateError(error instanceof Error ? error.message : '获取模板失败');
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const variableKeys = useMemo(() => {
    if (!selectedTemplate) {
      return [];
    }

    return selectedTemplate.variables?.length
      ? selectedTemplate.variables
      : extractVariables(selectedTemplate.content);
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

  const openCreateModal = () => {
    setModalMode('create');
    setTemplateForm({name: '', content: ''});
    setTemplateFormError('');
    setShowTemplateModal(true);
  };

  const openEditModal = (template: CommandTemplate) => {
    setModalMode('edit');
    setTemplateForm({name: template.name, content: template.content});
    setTemplateFormError('');
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const closeTemplateModal = () => {
    if (savingTemplate) {
      return;
    }
    setShowTemplateModal(false);
  };

  const handleSaveTemplate = async () => {
    const payload = {
      name: templateForm.name.trim(),
      content: templateForm.content.trim(),
    };

    if (!payload.name || !payload.content) {
      setTemplateFormError('模板名称和内容不能为空');
      return;
    }

    setSavingTemplate(true);
    setTemplateFormError('');

    try {
      if (modalMode === 'create') {
        const response = await fetch('/api/command-templates', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`新增模板失败: ${response.status}`);
        }
      } else {
        if (!selectedTemplate) {
          throw new Error('未选择需要编辑的模板');
        }

        const response = await fetch(`/api/command-templates/${selectedTemplate.id}`, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`更新模板失败: ${response.status}`);
        }
      }

      await loadTemplates();
      setShowTemplateModal(false);
    } catch (error) {
      setTemplateFormError(error instanceof Error ? error.message : '模板保存失败');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (template: CommandTemplate) => {
    if (!window.confirm(`确认删除模板「${template.name}」吗？`)) {
      return;
    }

    setDeletingTemplateId(template.id);
    setTemplateError('');

    try {
      const response = await fetch(`/api/command-templates/${template.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`删除模板失败: ${response.status}`);
      }

      if (selectedTemplate?.id === template.id) {
        setSelectedTemplate(null);
        setMode(null);
        setEditorValue('');
        setVariableValues({});
        resetExecutionState();
      }

      await loadTemplates();
    } catch (error) {
      setTemplateError(error instanceof Error ? error.message : '删除模板失败');
    } finally {
      setDeletingTemplateId('');
    }
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

    const initialValues = variableKeys.reduce<Record<string, string>>((result, key) => {
      result[key] = '';
      return result;
    }, {});

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
            <span className="command-hero-hint">
              {selectedTemplate ? `当前模板：${selectedTemplate.name}` : '先选择左侧模板开始操作'}
            </span>
          </div>
        </div>

        <div className="command-summary-card">
          <span className="command-summary-badge">Command</span>
          <strong>{templates.length}</strong>
          <p>当前共有 {templates.length} 个命令模板，可用于日志查询、服务重启或自定义发布场景。</p>

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
            <div className="command-sidebar-head-actions">
              <span className="command-panel-meta">{templates.length} 个模板</span>
              <button type="button" className="command-secondary-button" onClick={openCreateModal}>
                新增模板
              </button>
            </div>
          </div>

          {templateError ? <p className="command-inline-error">{templateError}</p> : null}

          {loadingTemplates ? (
            <div className="command-inline-empty">
              <p>模板加载中...</p>
            </div>
          ) : (
            <div className="command-template-list">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={
                    selectedTemplate?.id === template.id
                      ? 'command-template-card command-template-card-active'
                      : 'command-template-card'
                  }
                >
                  <button type="button" className="command-template-select" onClick={() => handleTemplateClick(template)}>
                    <div className="command-template-card-top">
                      <h4>{template.name}</h4>
                      <span>{extractVariables(template.content).length} 个变量</span>
                    </div>
                    <p>{template.description || '暂无模板说明。'}</p>
                    <code>{template.content}</code>
                  </button>

                  <div className="command-template-card-actions">
                    <button
                      type="button"
                      className="command-secondary-button"
                      onClick={() => openEditModal(template)}
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      className="command-secondary-button"
                      onClick={() => handleDeleteTemplate(template)}
                      disabled={deletingTemplateId === template.id}
                    >
                      {deletingTemplateId === template.id ? '删除中...' : '删除'}
                    </button>
                  </div>
                </div>
              ))}

              {templates.length === 0 ? (
                <div className="command-inline-empty">
                  <p>暂无模板，请点击“新增模板”创建。</p>
                </div>
              ) : null}
            </div>
          )}
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
                  <button
                    type="button"
                    className="command-primary-button"
                    onClick={handleExecute}
                    disabled={executing || !finalCommand.trim()}
                  >
                    {executing ? '执行中...' : '执行命令'}
                  </button>
                </div>

                <pre className="command-preview-box">{finalCommand || '当前还没有可执行命令。'}</pre>
              </section>
            </>
          )}

          {executeResult || executeError ? (
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
        <div className="command-modal" role="dialog" aria-modal="true">
          <div className="command-modal-panel">
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

      {showTemplateModal ? (
        <div className="command-modal" role="dialog" aria-modal="true">
          <div className="command-modal-panel">
            <div className="command-modal-header">
              <div>
                <p>Template Editor</p>
                <h3>{modalMode === 'create' ? '新增命令模板' : '编辑命令模板'}</h3>
              </div>
              <button
                type="button"
                className="command-secondary-button"
                onClick={closeTemplateModal}
                disabled={savingTemplate}
              >
                关闭
              </button>
            </div>

            <div className="command-editor-section">
              <label className="command-field">
                模板名称
                <input
                  className="command-text-input"
                  value={templateForm.name}
                  onChange={(event) => setTemplateForm((current) => ({...current, name: event.target.value}))}
                  placeholder="请输入模板名称"
                />
              </label>

              <label className="command-field">
                模板命令
                <textarea
                  className="command-code-editor"
                  value={templateForm.content}
                  onChange={(event) => setTemplateForm((current) => ({...current, content: event.target.value}))}
                  placeholder="例如: tail -n {{lines}} /var/log/{{fileName}}"
                />
              </label>

              {templateFormError ? <p className="command-inline-error">{templateFormError}</p> : null}
            </div>

            <div className="command-modal-actions">
              <button
                type="button"
                className="command-primary-button"
                onClick={handleSaveTemplate}
                disabled={savingTemplate}
              >
                {savingTemplate ? '保存中...' : '保存模板'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default CommandPage;
