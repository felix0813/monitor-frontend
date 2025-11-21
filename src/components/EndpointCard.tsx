// src/components/EndpointCard.tsx
import React from 'react';
import type {Endpoint} from '../types';
import axios from "axios";

interface EndpointCardProps {
    endpoint: Endpoint;
    onEndpointUpdate: () => void;
}

const EndpointCard: React.FC<EndpointCardProps> = ({endpoint, onEndpointUpdate}) => {
    // 手动检查端点状态

    const checkEndpointNow = async () => {
        try {
            await axios.post(`/api/endpoints/${endpoint.id}/check`);
            onEndpointUpdate(); // 刷新数据
        } catch (error) {
            console.error('Failed to check endpoint:', error);
        }
    };


    // 获取状态颜色
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'green';
            case 'unhealthy':
                return 'red';
            default:
                return 'gray';
        }
    };

    return (
        <div className="endpoint-card">
            <div className="endpoint-header">
                <h3>{endpoint.name}</h3>
                <span
                    className="status-indicator"
                    style={{backgroundColor: getStatusColor(endpoint.last_status)}}
                >
          {endpoint.last_status || '未知'}
        </span>
            </div>

            <div className="endpoint-details">
                <p><strong>URL:</strong> {endpoint.url}</p>
                <p><strong>方法:</strong> {endpoint.method}</p>
                <p><strong>最后延迟:</strong> {endpoint.last_latency ? `${endpoint.last_latency}ms` : 'N/A'}</p>
                <p><strong>检查间隔:</strong> {endpoint.interval}s</p>
            </div>

            <div className="endpoint-actions">
                <button onClick={checkEndpointNow}>立即检查</button>
            </div>
        </div>
    );
};

export default EndpointCard;
