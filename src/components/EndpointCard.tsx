// src/components/EndpointCard.tsx
import React from 'react';
import type { Endpoint } from '../types';
import axios from "axios";
import "../styles/dashboard.css"

interface EndpointCardProps {
    endpoint: Endpoint;
    onEndpointUpdate: () => void;
}

const EndpointCard: React.FC<EndpointCardProps> = ({ endpoint, onEndpointUpdate }) => {
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
            case '健康':
                return '#4CAF50'; // 绿色
            case '警告':
                return '#FF9800'; // 橙色
            case '错误':
                return '#F44336'; // 红色
            default:
                return '#9E9E9E'; // 灰色
        }
    };
// 添加删除端点的函数
const deleteEndpoint = async () => {
    if (!window.confirm(`确定要删除端点 "${endpoint.name}" 吗？`)) {
        return;
    }

    try {
        await axios.delete(`/api/endpoints/${endpoint.id}`);
        onEndpointUpdate(); // 删除成功后刷新数据
    } catch (error) {
        console.error('Failed to delete endpoint:', error);
        alert('删除端点失败');
    }
};

    return (
        <div className="endpoint-card">
            <div className="endpoint-header">
                <h3>{endpoint.name}</h3>
                <span
                    className="status-indicator"
                    style={{
                        backgroundColor: getStatusColor(endpoint.last_status),
                        padding: '4px 12px',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '0.85rem',
                        fontWeight: '500'
                    }}
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
                <button
                    onClick={checkEndpointNow}
                    className="check-button"
                >
                    立即检查
                </button>
                <button
                    onClick={deleteEndpoint}
                    className="delete-button"
                >
                    删除
                </button>
            </div>
        </div>
    );
};

export default EndpointCard;
