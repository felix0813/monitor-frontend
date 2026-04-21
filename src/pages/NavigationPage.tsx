import React, {useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import navigationService from '../services/NavigationService';
import type {NavigationSite, CreateNavigationSiteRequest, UpdateNavigationSiteRequest} from '../types';
import '../styles/navigation.css';

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

function NavigationPage() {
    const [links, setLinks] = useState<NavigationSite[]>([]);
    const [query, setQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        loadNavigationSites();
    }, []);

    const loadNavigationSites = async () => {
        try {
            setLoading(true);
            const data = await navigationService.listNavigationSites();
            setLinks(data);
        } catch (error) {
            console.error('Failed to load navigation sites:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = useMemo(() => {
        const allTags = links.flatMap((item) => item.tags || []);
        return Array.from(new Set(allTags.filter(Boolean)));
    }, [links]);

    const filteredLinks = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        if (!keyword) {
            return links;
        }

        return links.filter((item) =>
            [item.name, item.description, ...(item.tags || []), item.url]
                .join(' ')
                .toLowerCase()
                .includes(keyword),
        );
    }, [links, query]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const requestData: CreateNavigationSiteRequest = {
            url: normalizeUrl(form.url.trim()),
            name: form.title.trim(),
            description: form.description.trim(),
            tags: form.category.trim() ? [form.category.trim()] : [],
        };

        try {
            if (editingId) {
                const updateData: UpdateNavigationSiteRequest = {
                    url: requestData.url,
                    name: requestData.name,
                    description: requestData.description,
                    tags: requestData.tags,
                };
                const updated = await navigationService.updateNavigationSite(editingId, updateData);
                setLinks((current) => current.map((item) => item.id === editingId ? updated : item));
            } else {
                const newSite = await navigationService.createNavigationSite(requestData);
                setLinks((current) => [newSite, ...current]);
            }

            setForm(emptyForm);
            setShowForm(false);
            setEditingId(null);
        } catch (error) {
            console.error('Failed to save navigation site:', error);
            alert('保存失败，请重试');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('确定要删除这个导航条目吗？')) {
            return;
        }

        try {
            await navigationService.deleteNavigationSite(id);
            setLinks((current) => current.filter((item) => item.id !== id));
        } catch (error) {
            console.error('Failed to delete navigation site:', error);
            alert('删除失败，请重试');
        }
    };

    const handleEdit = (site: NavigationSite) => {
        setForm({
            title: site.name,
            url: site.url,
            description: site.description || '',
            category: site.tags?.[0] || '',
            accent: accentOptions[Math.floor(Math.random() * accentOptions.length)],
        });
        setEditingId(site.id);
        setShowForm(true);
    };

    return (
        <section className="navigation-page">
            <header className="portal-hero">
                <div className="portal-copy">
                    <p className="portal-kicker">Curated Start Page</p>
                    <h2>收藏常用网站，<br/>一站式快速访问。</h2>
                    <p className="portal-description">
                        像浏览器书签一样简单好用，管理内部系统和工具平台，让查找更高效。
                    </p>

                    <div className="portal-actions">
                        <button type="button" className="portal-primary-button" onClick={() => {
                            setForm(emptyForm);
                            setEditingId(null);
                            setShowForm(true);
                        }}>
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
            </section>

            {loading ? (
                <div className="portal-loading">加载中...</div>
            ) : (
                <section className="portal-grid">
                    {filteredLinks.map((item) => (
                        <article key={item.id} className="portal-card" style={{['--card-accent' as string]: item.tags && item.tags.length > 0 ? accentOptions[item.tags[0].charCodeAt(0) % accentOptions.length] : accentOptions[0]}}>
                            <div className="portal-card-top">
                                <span className="portal-card-category">{item.tags?.[0] || '未分类'}</span>
                                <div className="portal-card-actions">
                                    <button type="button" className="portal-delete" onClick={() => handleEdit(item)}>
                                        编辑
                                    </button>
                                    <button type="button" className="portal-delete" onClick={() => handleDelete(item.id)}>
                                        删除
                                    </button>
                                </div>
                            </div>

                            <h3>{item.name}</h3>
                            <p>{item.description || '未填写描述信息。'}</p>

                            <div className="portal-card-footer">
                                <span>{new URL(item.url).hostname}</span>
                                <a href={item.url} target="_blank" rel="noreferrer">
                                    访问
                                </a>
                            </div>
                        </article>
                    ))}

                    {filteredLinks.length === 0 && !loading && (
                        <div className="portal-empty-state">
                            <h3>没有匹配项</h3>
                            <p>尝试更换搜索词，或者添加新的内部系统入口。</p>
                        </div>
                    )}
                </section>
            )}

            {showForm && (
                <div className="portal-modal" onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm(emptyForm);
                }}>
                    <div className="portal-modal-panel" onClick={(event) => event.stopPropagation()}>
                        <div className="portal-modal-header">
                            <div>
                                <p>{editingId ? 'Edit Entry' : 'New Entry'}</p>
                                <h3>{editingId ? '编辑导航条目' : '添加一个新的导航条目'}</h3>
                            </div>
                            <button type="button" className="portal-close" onClick={() => {
                                setShowForm(false);
                                setEditingId(null);
                                setForm(emptyForm);
                            }}>
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

                            <div className="portal-form-actions">
                                <button type="button" className="portal-secondary-button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditingId(null);
                                            setForm(emptyForm);
                                        }}>
                                    取消
                                </button>
                                <button type="submit" className="portal-primary-button">
                                    {editingId ? '确认修改' : '确认添加'}
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
