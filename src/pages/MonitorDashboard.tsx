import React, {useEffect, useState} from 'react';
import axios from 'axios';
import ServiceCard from '../components/ServiceCard';
import type {Service} from '../types';
import '../styles/dashboard.css';

function MonitorDashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({ name: '', desc: '' });

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/services');
      setServices(response.data ?? []);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await axios.post('/api/services', newService);
      setServices((current) => [...current, response.data]);
      setNewService({ name: '', desc: '' });
      setShowAddService(false);
    } catch (error) {
      console.error('Failed to add service:', error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  if (loading) {
    return (
        <section className="dashboard-page">
          <div className="dashboard-loading-card">
            <div className="spinner"/>
            <p>正在加载服务列表...</p>
        </div>
        </section>
    );
  }

  return (
      <section className="dashboard-page">
        <div className="dashboard-header-card">
          <div>
            <p className="dashboard-kicker">Service Monitor</p>
            <h2>服务监控中心</h2>
            <p className="dashboard-intro">当前服务监控页面已迁移到 `/monitor`，后续可以在此扩展更多功能页面</p>
          </div>

          <div className="dashboard-header-actions">
            <button type="button" className="ghost-action-button" onClick={() => window.open('/probe', '_blank')}>
              探测页面
            </button>
            <button type="button" className="primary-action-button" onClick={() => setShowAddService(true)}>
              添加服务
            </button>
          </div>
        </div>

        {showAddService && (
            <div className="modal" onClick={() => setShowAddService(false)}>
              <div className="modal-content" onClick={(event) => event.stopPropagation()}>
                <h2>添加路由</h2>
              <form onSubmit={handleAddService}>
                <div className="form-group">
                  <label htmlFor="service-name">服务名称</label>
                  <input
                      id="service-name"
                      type="text"
                      value={newService.name}
                      onChange={(event) => setNewService({...newService, name: event.target.value})}
                      required
                      className="form-input"
                      placeholder="请输入服务名称"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="service-desc">服务描述</label>
                  <textarea
                      id="service-desc"
                      value={newService.desc}
                      onChange={(event) => setNewService({...newService, desc: event.target.value})}
                      className="form-textarea"
                      placeholder="请输入服务描述信息"
                      rows={4}
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddService(false)}>
                    取消
                  </button>
                  <button type="submit" className="btn-primary">
                    确认添加
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="services-list">
          {services.length > 0 ? (
              services.map((service) => <ServiceCard key={service.id} service={service} onUpdate={fetchServices}/>)
          ) : (
            <div className="empty-state">
              <p>暂无服务，请添加第一个服务开始监控。</p>
            </div>
          )}
      </div>
      </section>
  );
}

export default MonitorDashboard;
