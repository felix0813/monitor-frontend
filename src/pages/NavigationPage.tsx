import React, {useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import '../styles/navigation.css';

interface QuickLink {
    id: string;
    title: string;
    url: string;
    description: string;
    category: string;
    accent: string;
}

const STORAGE_KEY = 'portal.quick-links';

const defaultLinks: QuickLink[] = [
    {
        id: 'ops-1',
        title: 'Grafana',
        url: 'https://grafana.com/',
        description: '查看指标、仪表盘和告警配置。',
        category: '监控',
        accent: '#f97316',
    },
    {
        id: 'ops-2',
        title: 'GitHub',
        url: 'https://github.com/',
        description: '代码仓库、PR 和发布协作平台。',
        category: '研发',
        accent: '#22c55e',
    },
    {
        id: 'ops-3',
        title: 'Kibana',
        url: 'https://www.elastic.co/kibana',
        description: '检索日志、定位异常和分析链路。',
        category: '日志',
        accent: '#0ea5e9',
    },
    {
        id: 'ops-4',
        title: 'Jenkins',
        url: 'https://www.jenkins.io/',
        description: '构建流水线与发布管理面板。',
        category: '部署',
        accent: '#ef4444',
    },
];

const accentOptions = ['#0f766e', '#2563eb', '#9333ea', '#ea580c', '#dc2626', '#059669'];

const emptyForm = {
    title: '',
    url: '',
    description: '',
    category: '',
    accent: accentOptions[0],
};

function normalizeUrl(url: string) {
    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    return `https://${url}`;
}

function readStoredLinks(): QuickLink[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLinks));
        return defaultLinks;
    }

    try {
        return JSON.parse(raw) as QuickLink[];
    } catch {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLinks));
        return defaultLinks;
    }
}

function NavigationPage() {
    const [links, setLinks] = useState<QuickLink[]>([]);
    const [query, setQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLinks(readStoredLinks());
        setIsReady(true);
    }, []);

    useEffect(() => {
        if (isReady) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
        }
    }, [isReady, links]);

    const categories = useMemo(() => {
        return Array.from(new Set(links.map((item) => item.category).filter(Boolean)));
    }, [links]);

    const filteredLinks = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        if (!keyword) {
            return links;
        }

        return links.filter((item) =>
            [item.title, item.description, item.category, item.url]
                .join(' ')
                .toLowerCase()
                .includes(keyword),
        );
    }, [links, query]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const nextLink: QuickLink = {
            id: `${Date.now()}`,
            title: form.title.trim(),
            url: normalizeUrl(form.url.trim()),
            description: form.description.trim(),
            category: form.category.trim() || '未分类',
            accent: form.accent,
        };

        setLinks((current) => [nextLink, ...current]);
        setForm(emptyForm);
        setShowForm(false);
    };

    const handleDelete = (id: string) => {
        setLinks((current) => current.filter((item) => item.id !== id));
    };

    return (
        <section className="navigation-page">
            <header className="portal-hero">
                <div className="portal-copy">
                    <p className="portal-kicker">Curated Start Page</p>
                    <h2>记录最常访问的地址，把分散系统和常用页面统一收口。</h2>
                    <p className="portal-description">
                        参考浏览器书签的卡片式导航页，更偏向运维内部系统，可以快速添加常用地址并附上备注信息。
                    </p>

                    <div className="portal-actions">
                        <button type="button" className="portal-primary-button" onClick={() => setShowForm(true)}>
                            添加地址
                        </button>
                        <Link to="/monitor" className="portal-secondary-button">
                            监控首页
                        </Link>
                    </div>
                </div>

                <div className="portal-summary-card">
                    <span>收录站点</span>
                    <strong>{links.length}</strong>
                    <p>已覆盖 {categories.length || 1} 个分类，默认首页支持快速检索入口。</p>
                    <div className="portal-chip-row">
                        {(categories.length > 0 ? categories : ['未分类']).slice(0, 4).map((item) => (
                            <span key={item} className="portal-chip">
                {item}
              </span>
                        ))}
                    </div>
                </div>
            </header>

            <section className="portal-toolbar">
                <label className="portal-search">
                    <span>搜索</span>
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="搜索标题、说明或完整地址"
                    />
                </label>
                <div className="portal-toolbar-note">数据保存在当前浏览器本地，后续可接入后端接口或直接替换存储层。</div>
            </section>

            <section className="portal-grid">
                {filteredLinks.map((item) => (
                    <article key={item.id} className="portal-card" style={{['--card-accent' as string]: item.accent}}>
                        <div className="portal-card-top">
                            <span className="portal-card-category">{item.category}</span>
                            <button type="button" className="portal-delete" onClick={() => handleDelete(item.id)}>
                                删除
                            </button>
                        </div>

                        <h3>{item.title}</h3>
                        <p>{item.description || '未填写描述信息。'}</p>

                        <div className="portal-card-footer">
                            <span>{new URL(item.url).hostname}</span>
                            <a href={item.url} target="_blank" rel="noreferrer">
                                访问
                            </a>
                        </div>
                    </article>
                ))}

                {filteredLinks.length === 0 && (
                    <div className="portal-empty-state">
                        <h3>没有匹配项</h3>
                        <p>尝试更换搜索词，或者添加新的内部系统入口。</p>
                    </div>
                )}
            </section>

            {showForm && (
                <div className="portal-modal" onClick={() => setShowForm(false)}>
                    <div className="portal-modal-panel" onClick={(event) => event.stopPropagation()}>
                        <div className="portal-modal-header">
                            <div>
                                <p>New Entry</p>
                                <h3>添加一个新的导航条目</h3>
                            </div>
                            <button type="button" className="portal-close" onClick={() => setShowForm(false)}>
                                关闭
                            </button>
                        </div>

                        <form className="portal-form" onSubmit={handleSubmit}>
                            <label>
                                标题
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(event) => setForm((current) => ({
                                        ...current,
                                        title: event.target.value
                                    }))}
                                    placeholder="例如：Prometheus"
                                    required
                                />
                            </label>

                            <label>
                                地址
                                <input
                                    type="text"
                                    value={form.url}
                                    onChange={(event) => setForm((current) => ({...current, url: event.target.value}))}
                                    placeholder="例如：prometheus.example.com"
                                    required
                                />
                            </label>

                            <label>
                                分类
                                <input
                                    type="text"
                                    value={form.category}
                                    onChange={(event) => setForm((current) => ({
                                        ...current,
                                        category: event.target.value
                                    }))}
                                    placeholder="例如：监控 / 文档 / 工具"
                                />
                            </label>

                            <label>
                                描述
                                <textarea
                                    value={form.description}
                                    onChange={(event) => setForm((current) => ({
                                        ...current,
                                        description: event.target.value
                                    }))}
                                    placeholder="简要说明这个链接是做什么的？"
                                    rows={4}
                                />
                            </label>

                            <label>
                                强调色
                                <div className="portal-accent-list">
                                    {accentOptions.map((accent) => (
                                        <button
                                            key={accent}
                                            type="button"
                                            className={form.accent === accent ? 'portal-accent portal-accent-active' : 'portal-accent'}
                                            style={{backgroundColor: accent}}
                                            onClick={() => setForm((current) => ({...current, accent}))}
                                        />
                                    ))}
                                </div>
                            </label>

                            <div className="portal-form-actions">
                                <button type="button" className="portal-secondary-button"
                                        onClick={() => setShowForm(false)}>
                                    取消
                                </button>
                                <button type="submit" className="portal-primary-button">
                                    确认添加
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}

export default NavigationPage;
