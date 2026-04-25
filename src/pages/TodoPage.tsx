import {useEffect, useMemo, useState} from 'react';
import type {FormEvent} from 'react';
import '../styles/todo.css';
import todoService from '../services/TodoService';
import type {TodoProject, TodoItem, TodoStatus} from '../types';



function TodoPage() {
  const [projects, setProjects] = useState<TodoProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [todoDrafts, setTodoDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const loadedProjects = await todoService.listTodoProjects();
      setProjects(loadedProjects);
      if (loadedProjects.length > 0 && !activeProjectId) {
        setActiveProjectId(loadedProjects[0].id);
      }
    } catch (error) {
      console.error('Failed to load todo projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? projects[0] ?? null,
    [activeProjectId, projects],
  );

  const totalTodos = useMemo(
    () => projects.reduce((count, project) => count + Object.keys(project.items).length, 0),
    [projects],
  );

  const completedTodos = useMemo(
    () =>
      projects.reduce(
        (count, project) =>
          count +
          Object.values(project.items).filter((item) => item.status === 'done').length,
        0,
      ),
    [projects],
  );

  const pendingTodos = totalTodos - completedTodos;

  const handleAddProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = projectName.trim();
    if (!name) {
      return;
    }

    try {
      const newProject = await todoService.createTodoProject({
        name,
        description: projectDescription.trim(),
      });
      setProjects((current) => [newProject, ...current]);
      setActiveProjectId(newProject.id);
      setProjectName('');
      setProjectDescription('');
    } catch (error) {
      console.error('Failed to create todo project:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await todoService.deleteTodoProject(projectId);
      setProjects((current) => {
        const nextProjects = current.filter((project) => project.id !== projectId);
        if (projectId === activeProjectId) {
          setActiveProjectId(nextProjects[0]?.id ?? null);
        }
        return nextProjects;
      });

      setTodoDrafts((current) => {
        const nextDrafts = {...current};
        delete nextDrafts[projectId];
        return nextDrafts;
      });
    } catch (error) {
      console.error('Failed to delete todo project:', error);
    }
  };

  const handleAddTodo = async (projectId: string) => {
    const title = todoDrafts[projectId]?.trim();
    if (!title) {
      return;
    }

    try {
      const newItem = await todoService.createTodoItem(projectId, {
        description: title,
        status: 'pending',
      });

      setProjects((current) =>
        current.map((project) => {
          if (project.id !== projectId) {
            return project;
          }
          return {
            ...project,
            items: {
              ...project.items,
              [newItem.id]: newItem,
            },
            ordered_ids: [...project.ordered_ids, newItem.id],
          };
        }),
      );

      setTodoDrafts((current) => ({...current, [projectId]: ''}));
    } catch (error) {
      console.error('Failed to create todo item:', error);
    }
  };

  const handleToggleTodo = async (projectId: string, todoId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const todo = project.items[todoId];
    if (!todo) return;

    const newStatus: TodoStatus = todo.status === 'done' ? 'pending' : 'done';

    try {
      const updatedItem = await todoService.updateTodoItem(projectId, todoId, {
        status: newStatus,
      });

      setProjects((current) =>
        current.map((p) => {
          if (p.id !== projectId) {
            return p;
          }
          return {
            ...p,
            items: {
              ...p.items,
              [todoId]: updatedItem,
            },
          };
        }),
      );
    } catch (error) {
      console.error('Failed to update todo item:', error);
    }
  };

  const handleDeleteTodo = async (projectId: string, todoId: string) => {
    try {
      await todoService.deleteTodoItem(projectId, todoId);

      setProjects((current) =>
        current.map((project) => {
          if (project.id !== projectId) {
            return project;
          }
          const {[todoId]: _, ...remainingItems} = project.items;
          return {
            ...project,
            items: remainingItems,
            ordered_ids: project.ordered_ids.filter((id) => id !== todoId),
          };
        }),
      );
    } catch (error) {
      console.error('Failed to delete todo item:', error);
    }
  };

  const getProjectTodoList = (project: TodoProject): TodoItem[] => {
    return project.ordered_ids
      .map((id) => project.items[id])
      .filter(Boolean);
  };

  if (loading) {
    return (
      <section className="todo-page">
        <div className="dashboard-loading-card">
          <div className="spinner"/>
          <p>正在加载待办事项...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="todo-page">
      <header className="todo-hero">
        <div className="todo-hero-copy">
          <p className="todo-kicker">Workspace Todo</p>
          <h2>项目 Todo 管理</h2>
          <p className="todo-description">
            按项目整理需求和开发事项，记录待办事项。
          </p>

          <div className="todo-hero-actions">
            <a href="#todo-project-form" className="todo-primary-action">
              新建项目
            </a>
            <a href="#todo-focus-panel" className="todo-secondary-action">
              查看 Todo
            </a>
          </div>
        </div>

        <div className="todo-overview-card">
          <div className="todo-overview-heading">
            <span className="todo-overview-badge">Todo</span>
            <strong>开发提醒面板</strong>
          </div>

          <div className="todo-stats-grid">
            <article>
              <span>项目数</span>
              <strong>{projects.length}</strong>
            </article>
            <article>
              <span>待办</span>
              <strong>{pendingTodos}</strong>
            </article>
            <article>
              <span>已完成</span>
              <strong>{completedTodos}</strong>
            </article>
          </div>

          <p className="todo-overview-text">
            适合记录接口改造、页面补齐和前检查点。
          </p>
        </div>
      </header>

      <section className="todo-content-grid">
        <div className="todo-column">
          <section className="todo-panel todo-project-form" id="todo-project-form">
            <div className="todo-panel-head">
              <div>
                <p className="todo-panel-kicker">New Project</p>
                <h3>添加一个项目</h3>
              </div>
            </div>

            <form className="todo-form" onSubmit={handleAddProject}>
              <label>
                项目名称
                <input
                  type="text"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  placeholder="例如：工作台改版"
                  required
                />
              </label>

              <label>
                项目说明
                <textarea
                  value={projectDescription}
                  onChange={(event) => setProjectDescription(event.target.value)}
                  placeholder="简短说明这个项目当前在做什么"
                  rows={3}
                />
              </label>

              <button type="submit" className="todo-submit-button">
                添加项目
              </button>
            </form>
          </section>

          <section className="todo-panel">
            <div className="todo-panel-head">
              <div>
                <p className="todo-panel-kicker">Project List</p>
                <h3>项目清单</h3>
              </div>
              <span className="todo-panel-meta">{projects.length} 个项目</span>
            </div>

            <div className="todo-project-list">
              {projects.length === 0 ? (
                <div className="todo-empty">
                  <h4>还没有项目</h4>
                  <p>先创建一个项目，再把待开发功能逐条记进去。</p>
                </div>
              ) : (
                projects.map((project) => {
                  const todoList = getProjectTodoList(project);
                  const doneCount = todoList.filter((todo) => todo.status === 'done').length;
                  const pendingCount = todoList.length - doneCount;

                  return (
                    <article
                      key={project.id}
                      className={
                        project.id === activeProject?.id
                          ? 'todo-project-card todo-project-card-active'
                          : 'todo-project-card'
                      }
                    >
                      <button
                        type="button"
                        className="todo-project-main"
                        onClick={() => setActiveProjectId(project.id)}
                      >
                        <div className="todo-project-title-row">
                          <h4>{project.name}</h4>
                          <span>{pendingCount} 项待处理</span>
                        </div>
                        <p>{project.description || '暂无项目说明，适合先记下需要开发的关键点。'}</p>
                        <div className="todo-project-progress">
                          <span>已完成 {doneCount}</span>
                          <span>总计 {todoList.length}</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        className="todo-delete-button"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        删除项目
                      </button>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>

        <section className="todo-panel todo-focus-panel" id="todo-focus-panel">
          <div className="todo-panel-head">
            <div>
              <p className="todo-panel-kicker">Todo Board</p>
              <h3>{activeProject?.name || '项目待办'}</h3>
            </div>
            {activeProject ? (
              <span className="todo-panel-meta">
                {getProjectTodoList(activeProject).filter((todo) => todo.status !== 'done').length} 项未完成
              </span>
            ) : null}
          </div>

          {activeProject ? (
            <>
              <p className="todo-focus-description">
                {activeProject.description || '这个项目还没有说明，可以直接从具体待办开始记录。'}
              </p>

              <div className="todo-composer">
                <input
                  type="text"
                  value={todoDrafts[activeProject.id] || ''}
                  onChange={(event) =>
                    setTodoDrafts((current) => ({
                      ...current,
                      [activeProject.id]: event.target.value,
                    }))
                  }
                  placeholder="输入一个需要开发或跟进的功能点"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleAddTodo(activeProject.id);
                    }
                  }}
                />
                <button
                  type="button"
                  className="todo-submit-button"
                  onClick={() => handleAddTodo(activeProject.id)}
                >
                  添加 Todo
                </button>
              </div>

              <div className="todo-list">
                {getProjectTodoList(activeProject).length === 0 ? (
                  <div className="todo-empty todo-empty-compact">
                    <h4>这个项目还没有待办</h4>
                    <p>把后续要开发的模块、优化项或联调事项加进来即可。</p>
                  </div>
                ) : (
                  getProjectTodoList(activeProject).map((todo) => (
                    <article
                      key={todo.id}
                      className={todo.status === 'done' ? 'todo-item todo-item-done' : 'todo-item'}
                    >
                      <button
                        type="button"
                        className={todo.status === 'done' ? 'todo-check todo-check-done' : 'todo-check'}
                        onClick={() => handleToggleTodo(activeProject.id, todo.id)}
                        aria-label={todo.status === 'done' ? '标记为未完成' : '标记为已完成'}
                      >
                        {todo.status === 'done' ? '已完成' : '进行中'}
                      </button>

                      <div className="todo-copy">
                        <h4>{todo.description}</h4>
                        <p>{todo.status === 'done' ? '该事项已完成。' : '待开发或待确认。'}</p>
                      </div>

                      <button
                        type="button"
                        className="todo-delete-button todo-delete-button-subtle"
                        onClick={() => handleDeleteTodo(activeProject.id, todo.id)}
                      >
                        删除
                      </button>
                    </article>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="todo-empty">
              <h4>先创建项目，再添加 Todo</h4>
              <p>Todo 页面已经准备好，创建后就可以开始记录每个项目的开发事项。</p>
            </div>
          )}
        </section>
      </section>
    </section>
  );
}

export default TodoPage;
