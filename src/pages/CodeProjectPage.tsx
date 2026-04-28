import type {FormEvent} from 'react';
import {useEffect, useMemo, useState} from 'react';
import codeProjectService from '../services/CodeProjectService';
import '../styles/code-project.css';
import type {CodeProject} from '../types';

type ProjectForm = {
  project_name: string;
  code_url: string;
  pipeline_url: string;
  deploy_url: string;
  data_url: string;
};

const emptyForm: ProjectForm = {
  project_name: '',
  code_url: '',
  pipeline_url: '',
  deploy_url: '',
  data_url: '',
};

function mapProjectToForm(project: CodeProject): ProjectForm {
  return {
    project_name: project.project_name,
    code_url: project.code_url,
    pipeline_url: project.pipeline_url,
    deploy_url: project.deploy_url,
    data_url: project.data_url,
  };
}

function CodeProjectPage() {
  const [projects, setProjects] = useState<CodeProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<ProjectForm>(emptyForm);

  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState<ProjectForm>(emptyForm);
  const [savingId, setSavingId] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const loadProjects = async () => {
    setLoading(true);
    setErrorText('');

    try {
      const data = await codeProjectService.listCodeProjects();
      setProjects(data);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : '加载项目记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const linkedCount = useMemo(
    () =>
      projects.filter((project) => project.pipeline_url || project.deploy_url || project.data_url)
        .length,
    [projects],
  );

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      project_name: createForm.project_name.trim(),
      code_url: createForm.code_url.trim(),
      pipeline_url: createForm.pipeline_url.trim(),
      deploy_url: createForm.deploy_url.trim(),
      data_url: createForm.data_url.trim(),
    };

    if (!payload.project_name || !payload.code_url) {
      setErrorText('项目名称和代码仓库地址不能为空');
      return;
    }

    setCreating(true);
    setErrorText('');

    try {
      const created = await codeProjectService.createCodeProject(payload);
      setProjects((current) => [created, ...current]);
      setCreateForm(emptyForm);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : '创建项目记录失败');
    } finally {
      setCreating(false);
    }
  };

  const handleStartEdit = (project: CodeProject) => {
    setEditingId(project.id);
    setEditForm(mapProjectToForm(project));
    setErrorText('');
  };

  const handleCancelEdit = () => {
    setEditingId('');
    setEditForm(emptyForm);
  };

  const handleSaveEdit = async (projectId: string) => {
    const payload = {
      project_name: editForm.project_name.trim(),
      code_url: editForm.code_url.trim(),
      pipeline_url: editForm.pipeline_url.trim(),
      deploy_url: editForm.deploy_url.trim(),
      data_url: editForm.data_url.trim(),
    };

    if (!payload.project_name || !payload.code_url) {
      setErrorText('项目名称和代码仓库地址不能为空');
      return;
    }

    setSavingId(projectId);
    setErrorText('');

    try {
      const updated = await codeProjectService.updateCodeProject(projectId, payload);
      setProjects((current) =>
        current.map((item) => (item.id === projectId ? updated : item)),
      );
      setEditingId('');
      setEditForm(emptyForm);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : '保存项目记录失败');
    } finally {
      setSavingId('');
    }
  };

  const handleDelete = async (project: CodeProject) => {
    if (!window.confirm(`确认删除项目记录「${project.project_name}」吗？`)) {
      return;
    }

    setDeletingId(project.id);
    setErrorText('');

    try {
      await codeProjectService.deleteCodeProject(project.id);
      setProjects((current) => current.filter((item) => item.id !== project.id));
      if (editingId === project.id) {
        setEditingId('');
        setEditForm(emptyForm);
      }
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : '删除项目记录失败');
    } finally {
      setDeletingId('');
    }
  };

  if (loading) {
    return (
      <section className="code-project-page">
        <div className="code-project-loading-card">
          <div className="spinner" />
          <p>正在加载项目记录...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="code-project-page">
      <header className="code-project-hero">
        <div className="code-project-hero-copy">
          <p className="code-project-kicker">Workspace Record</p>
          <h2>项目记录</h2>
          <p className="code-project-description">
            统一记录项目代码、流水线、部署和数据地址，方便团队协作与交接。
          </p>
        </div>

        <div className="code-project-summary-card">
          <span className="code-project-summary-badge">Code Projects</span>
          <strong>{projects.length}</strong>
          <p>已维护项目记录</p>
          <div className="code-project-summary-meta">
            <span>已补充扩展链接 {linkedCount}</span>
          </div>
        </div>
      </header>

      <section className="code-project-content-grid">
        <article className="code-project-panel">
          <div className="code-project-panel-head">
            <div>
              <p className="code-project-panel-kicker">Create Record</p>
              <h3>新增项目记录</h3>
            </div>
          </div>

          <form className="code-project-form" onSubmit={handleCreate}>
            <label>
              项目名称
              <input
                value={createForm.project_name}
                onChange={(event) =>
                  setCreateForm((current) => ({...current, project_name: event.target.value}))
                }
                placeholder="例如：监控平台"
              />
            </label>

            <label>
              代码地址
              <input
                value={createForm.code_url}
                onChange={(event) =>
                  setCreateForm((current) => ({...current, code_url: event.target.value}))
                }
                placeholder="https://git.example.com/project"
              />
            </label>

            <label>
              流水线地址
              <input
                value={createForm.pipeline_url}
                onChange={(event) =>
                  setCreateForm((current) => ({...current, pipeline_url: event.target.value}))
                }
                placeholder="可选"
              />
            </label>

            <label>
              部署地址
              <input
                value={createForm.deploy_url}
                onChange={(event) =>
                  setCreateForm((current) => ({...current, deploy_url: event.target.value}))
                }
                placeholder="可选"
              />
            </label>

            <label>
              数据地址
              <input
                value={createForm.data_url}
                onChange={(event) =>
                  setCreateForm((current) => ({...current, data_url: event.target.value}))
                }
                placeholder="可选"
              />
            </label>

            <button type="submit" className="code-project-primary-button" disabled={creating}>
              {creating ? '创建中...' : '创建记录'}
            </button>
          </form>
        </article>

        <article className="code-project-panel">
          <div className="code-project-panel-head">
            <div>
              <p className="code-project-panel-kicker">Record List</p>
              <h3>项目记录列表</h3>
            </div>
          </div>

          {errorText ? <p className="code-project-error-text">{errorText}</p> : null}

          {projects.length === 0 ? (
            <div className="code-project-empty-state">
              <h4>暂无项目记录</h4>
              <p>先在左侧创建一条记录，后续即可维护链接信息。</p>
            </div>
          ) : (
            <div className="code-project-list">
              {projects.map((project) => {
                const isEditing = editingId === project.id;
                return (
                  <article key={project.id} className="code-project-item">
                    {isEditing ? (
                      <>
                        <div className="code-project-edit-grid">
                          <label>
                            项目名称
                            <input
                              value={editForm.project_name}
                              onChange={(event) =>
                                setEditForm((current) => ({
                                  ...current,
                                  project_name: event.target.value,
                                }))
                              }
                            />
                          </label>

                          <label>
                            代码地址
                            <input
                              value={editForm.code_url}
                              onChange={(event) =>
                                setEditForm((current) => ({...current, code_url: event.target.value}))
                              }
                            />
                          </label>

                          <label>
                            流水线地址
                            <input
                              value={editForm.pipeline_url}
                              onChange={(event) =>
                                setEditForm((current) => ({...current, pipeline_url: event.target.value}))
                              }
                            />
                          </label>

                          <label>
                            部署地址
                            <input
                              value={editForm.deploy_url}
                              onChange={(event) =>
                                setEditForm((current) => ({...current, deploy_url: event.target.value}))
                              }
                            />
                          </label>

                          <label>
                            数据地址
                            <input
                              value={editForm.data_url}
                              onChange={(event) =>
                                setEditForm((current) => ({...current, data_url: event.target.value}))
                              }
                            />
                          </label>
                        </div>

                        <div className="code-project-item-actions">
                          <button
                            type="button"
                            className="code-project-primary-button"
                            disabled={savingId === project.id}
                            onClick={() => handleSaveEdit(project.id)}
                          >
                            {savingId === project.id ? '保存中...' : '保存'}
                          </button>
                          <button
                            type="button"
                            className="code-project-secondary-button"
                            onClick={handleCancelEdit}
                          >
                            取消
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="code-project-item-head">
                          <h4>{project.project_name}</h4>
                          <span>记录中</span>
                        </div>

                        <div className="code-project-link-list">
                          <a>
                            代码地址: {project.code_url}
                          </a>
                          {project.pipeline_url ? (
                              <a>
                                流水线地址: {project.pipeline_url}
                              </a>
                          ) : null}
                          {project.deploy_url ? (
                              <a>
                                部署地址: {project.deploy_url}
                              </a>
                          ) : null}
                          {project.data_url ? (
                              <a>
                                数据地址: {project.data_url}
                              </a>
                          ) : null}
                        </div>

                        <div className="code-project-item-actions">
                          <button
                            type="button"
                            className="code-project-secondary-button"
                            onClick={() => handleStartEdit(project)}
                          >
                            编辑
                          </button>
                          <button
                            type="button"
                            className="code-project-secondary-button"
                            disabled={deletingId === project.id}
                            onClick={() => handleDelete(project)}
                          >
                            {deletingId === project.id ? '删除中...' : '删除'}
                          </button>
                        </div>
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </article>
      </section>
    </section>
  );
}

export default CodeProjectPage;
