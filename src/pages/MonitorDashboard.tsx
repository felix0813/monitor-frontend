// src/pages/MonitorDashboard.tsx
import React, {useEffect, useState} from 'react';
import type {Service} from '../types';
import ServiceCard from "../components/ServiceCard.tsx";
import axios from "axios";

const MonitorDashboard: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddService, setShowAddService] = useState(false);
    const [newService, setNewService] = useState({name: '', desc: ''});

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

    // 添加新服务
    const handleAddService = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/services', newService);
            setServices([...services, response.data]);
            setNewService({name: '', desc: ''});
            setShowAddService(false);
        } catch (error) {
            console.error('Failed to add service:', error);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    if (loading) {
        return <div className="dashboard">Loading...</div>;
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>服务监控面板</h1>
                <button
                    className="add-service-btn"
                    onClick={() => setShowAddService(true)}
                >
                    添加服务
                </button>
            </header>

            {showAddService && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>添加新服务</h2>
                        <form onSubmit={handleAddService}>
                            <div>
                                <label>服务名称:</label>
                                <input
                                    type="text"
                                    value={newService.name}
                                    onChange={(e) => setNewService({...newService, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label>服务描述:</label>
                                <textarea
                                    value={newService.desc}
                                    onChange={(e) => setNewService({...newService, desc: e.target.value})}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit">添加</button>
                                <button type="button" onClick={() => setShowAddService(false)}>取消</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="services-list">
                {services.map(service => (
                    <ServiceCard key={service.id} service={service} onServiceUpdate={fetchServices}/>
                ))}
            </div>
        </div>
    );
};

export default MonitorDashboard;
