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

export interface NavigationSite {
    id: string;
    image_url: string;
    url: string;
    name: string;
    description: string;
    tags: string[];
    created_at: string;
    updated_at: string;
}

export interface CreateNavigationSiteRequest {
    image_url?: string;
    url: string;
    name: string;
    description?: string;
    tags?: string[];
}

export interface UpdateNavigationSiteRequest {
    image_url?: string;
    url?: string;
    name?: string;
    description?: string;
    tags?: string[];
}

export type TodoStatus = 'pending' | 'done';

export interface TodoItem {
    id: string;
    description: string;
    status: TodoStatus;
    created_at: string;
    updated_at: string;
}

export interface TodoProject {
    id: string;
    name: string;
    description: string;
    ordered_ids: string[];
    items: Record<string, TodoItem>;
    created_at: string;
    updated_at: string;
}

export interface CreateTodoProjectRequest {
    name: string;
    description: string;
}

export interface UpdateTodoProjectRequest {
    name?: string;
    description?: string;
}

export interface CreateTodoItemRequest {
    description: string;
    status?: TodoStatus;
}

export interface UpdateTodoItemRequest {
    description?: string;
    status?: TodoStatus;
}