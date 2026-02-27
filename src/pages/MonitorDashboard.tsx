// src/pages/MonitorDashboard.tsx
import React, { useEffect, useState } from 'react';
import type { Service } from '../types';
import ServiceCard from "../components/ServiceCard.tsx";
import axios from "axios";
import '../styles/dashboard.css';

const MonitorDashboard: React.FC = () => {
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

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/services', newService);
      setServices([...services, response.data]);
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
      <div className="dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>正在加载服务数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>服务监控面板</h1>
          <div className="header-actions">
            <button
                className="probe-btn"
                onClick={() => window.open('/probe', '_blank')}
            >
              🚀 探针页面
            </button>
            <button
                className="add-service-btn"
                onClick={() => setShowAddService(true)}
            >
              + 添加服务
            </button>
          </div>
        </header>

        {showAddService && (
          <div className="modal">
            <div className="modal-content">
              <h2>添加新服务</h2>
              <form onSubmit={handleAddService}>
                <div className="form-group">
                  <label>服务名称:</label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    required
                    className="form-input"
                    placeholder="请输入服务名称"
                  />
                </div>
                <div className="form-group">
                  <label>服务描述:</label>
                  <textarea
                    value={newService.desc}
                    onChange={(e) => setNewService({ ...newService, desc: e.target.value })}
                    className="form-textarea"
                    placeholder="请输入服务描述（可选）"
                    rows={4}
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddService(false)}>取消</button>
                  <button type="submit" className="btn-primary">添加服务</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="services-list">
          {services.length > 0 ? (
            services.map(service => (
              <ServiceCard key={service.id} service={service} onUpdate={fetchServices} />
            ))
          ) : (
            <div className="empty-state">
              <p>暂无服务，请添加第一个服务开始监控</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonitorDashboard;
