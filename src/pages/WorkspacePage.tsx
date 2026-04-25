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
    title: '文档清单',
    label: 'Docs',
    description: '后续可用于归档需求文档、接口说明和发布记录，方便在工作台内统一查找。',
    to: '/workspace',
    actionText: '敬请期待',
    available: false,
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
            这里作为工作台首页，用来承载多个内部功能入口。当前已接入项目 Todo，后续可以继续扩展文档、发布、协作等模块。
          </p>
        </div>

        <div className="workspace-hub-summary">
          <span className="workspace-hub-summary-badge">Workspace</span>
          <strong>统一入口</strong>
          <p>先聚合常用能力，再逐步扩展成完整工作台，保持结构清晰，避免单个页面职责过重。</p>
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
