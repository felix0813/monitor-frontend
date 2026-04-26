import {Link} from 'react-router-dom';
import '../styles/workspace.css';

const features = [
  {
    title: '项目 Todo',
    label: 'Todo',
    description: '按项目整理待开发功能、联调事项和优化项，进入后可直接继续使用现有 Todo 功能。',
    to: '/todo',
    actionText: '进入 Todo',
    available: true,
  },
  {
    title: '快捷命令',
    label: 'Command',
    description: '使用和编辑命令模板，快速执行服务器命令。',
    to: '/command',
    actionText: '进入 快捷命令',
    available: true,
  },
  {
    title: '发布检查',
    label: 'Launch',
    description: '后续可加入上线前核对项、环境确认和回滚准备，形成标准化操作入口。',
    to: '/workspace',
    actionText: '敬请期待',
    available: false,
  },
];

function WorkspacePage() {
  return (
    <section className="workspace-hub-page">
      <header className="workspace-hub-hero">
        <div className="workspace-hub-copy">
          <p className="workspace-hub-kicker">Workspace Entry</p>
          <h2>工作台功能入口</h2>
          <p className="workspace-hub-description">
            内部功能入口<br/>
            - TODO<br/>
            - 快捷命令
          </p>
        </div>

        <div className="workspace-hub-summary">
          <span className="workspace-hub-summary-badge">Workspace</span>
          <strong>统一入口</strong>
          <p>聚合常用能力,轻松管理项目、服务器</p>
        </div>
      </header>

      <section className="workspace-hub-grid">
        {features.map((feature) => (
          <article
            key={feature.title}
            className={
              feature.available
                ? 'workspace-hub-card workspace-hub-card-active'
                : 'workspace-hub-card'
            }
          >
            <div className="workspace-hub-card-top">
              <span className="workspace-hub-card-label">{feature.label}</span>
              <span
                className={
                  feature.available
                    ? 'workspace-hub-status'
                    : 'workspace-hub-status workspace-hub-status-muted'
                }
              >
                {feature.available ? '已启用' : '待扩展'}
              </span>
            </div>

            <h3>{feature.title}</h3>
            <p>{feature.description}</p>

            {feature.available ? (
              <Link to={feature.to} className="workspace-hub-primary-action">
                {feature.actionText}
              </Link>
            ) : (
              <span className="workspace-hub-secondary-action">{feature.actionText}</span>
            )}
          </article>
        ))}
      </section>
    </section>
  );
}

export default WorkspacePage;
