// src/types/index.ts
export interface Service {
    id: string;
    name: string;
    desc: string;
    created_at: string;
    updated_at: string;
}

export interface Endpoint {
    id: string;
    service_id: string;
    name: string;
    url: string;
    method: string;
    interval: number;
    timeout: number;
    expected_status: number;
    last_status: string;
    last_latency: number;
    created_at: string;
    updated_at: string;
}
