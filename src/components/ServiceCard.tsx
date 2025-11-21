// src/components/ServiceCard.tsx
import React, {useEffect, useState} from 'react';
import type {Endpoint, Service} from '../types';
import EndpointCard from './EndpointCard';
import axios from "axios";

interface ServiceCardProps {
    service: Service;
    onServiceUpdate: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({service, onServiceUpdate}) => {
    const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
    const [expanded, setExpanded] = useState(true);
    const [showAddEndpoint, setShowAddEndpoint] = useState(false);
    const [newEndpoint, setNewEndpoint] = useState({
        name: '',
        url: '',
        method: 'GET',
        interval: 60,
        timeout: 30,
        expected_status: 200
    });


    // 获取服务的所有端点
    const fetchEndpoints = async () => {
        try {
            const response = await axios.get(`/api/services/${service.id}/endpoints`);
            setEndpoints(response.data ?? []);
        } catch (error) {
            console.error('Failed to fetch endpoints:', error);
        }
    };

// 添加新端点
    const handleAddEndpoint = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`/api/services/${service.id}/endpoints`, newEndpoint);
            fetchEndpoints();
            setNewEndpoint({
                name: '',
                url: '',
                method: 'GET',
                interval: 60,
                timeout: 30,
                expected_status: 200
            });
            setShowAddEndpoint(false);
        } catch (error) {
            console.error('Failed to add endpoint:', error);
        }
    };

    useEffect(() => {
        if (expanded) {
            fetchEndpoints();
        }
    }, [expanded, service.id]);

    return (
        <div className="service-card">
            <div className="service-header">
                <h2>{service.name}</h2>
                <div className="service-actions">
                    <span className="endpoint-count">{endpoints.length} 个端点</span>
                    <button onClick={() => setExpanded(!expanded)}>
                        {expanded ? '收起' : '展开'}
                    </button>
                    <button onClick={() => setShowAddEndpoint(true)}>添加端点</button>
                    <button onClick={fetchEndpoints}>刷新</button>
                </div>
            </div>

            {expanded && (
                <>
                    <p className="service-description">{service.desc}</p>

                    {showAddEndpoint && (
                        <div className="modal">
                            <div className="modal-content">
                                <h3>添加端点到 {service.name}</h3>
                                <form onSubmit={handleAddEndpoint}>
                                    <div>
                                        <label>端点名称:</label>
                                        <input
                                            type="text"
                                            value={newEndpoint.name}
                                            onChange={(e) => setNewEndpoint({...newEndpoint, name: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label>URL:</label>
                                        <input
                                            type="text"
                                            value={newEndpoint.url}
                                            onChange={(e) => setNewEndpoint({...newEndpoint, url: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label>请求方法:</label>
                                        <select
                                            value={newEndpoint.method}
                                            onChange={(e) => setNewEndpoint({...newEndpoint, method: e.target.value})}
                                        >
                                            <option value="GET">GET</option>
                                            <option value="POST">POST</option>
                                            <option value="PUT">PUT</option>
                                            <option value="DELETE">DELETE</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>检查间隔(秒):</label>
                                        <input
                                            type="number"
                                            value={newEndpoint.interval}
                                            onChange={(e) => setNewEndpoint({
                                                ...newEndpoint,
                                                interval: parseInt(e.target.value)
                                            })}
                                            min="10"
                                        />
                                    </div>
                                    <div>
                                        <label>超时时间(秒):</label>
                                        <input
                                            type="number"
                                            value={newEndpoint.timeout}
                                            onChange={(e) => setNewEndpoint({
                                                ...newEndpoint,
                                                timeout: parseInt(e.target.value)
                                            })}
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <label>期望状态码:</label>
                                        <input
                                            type="number"
                                            value={newEndpoint.expected_status}
                                            onChange={(e) => setNewEndpoint({
                                                ...newEndpoint,
                                                expected_status: parseInt(e.target.value)
                                            })}
                                            min="100"
                                            max="599"
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <button type="submit">添加</button>
                                        <button type="button" onClick={() => setShowAddEndpoint(false)}>取消</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="endpoints-grid">
                        {endpoints.map(endpoint => (
                            <EndpointCard
                                key={endpoint.id}
                                endpoint={endpoint}
                                onEndpointUpdate={fetchEndpoints}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ServiceCard;
