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

export interface CommandTemplate {
    id?: string;
    _id?: string;
    name: string;
    description?: string;
    content: string;
    variables?: string[];
}

export interface CommandTemplatePayload {
    name: string;
    content: string;
}

export interface ExecuteCommandResponse {
    success: boolean;
    output?: string;
    error?: string;
}

export interface CodeProject {
    id: string;
    project_name: string;
    code_url: string;
    pipeline_url: string;
    deploy_url: string;
    data_url: string;
    created_at: string;
    updated_at: string;
}

export interface CreateCodeProjectRequest {
    project_name: string;
    code_url: string;
    pipeline_url?: string;
    deploy_url?: string;
    data_url?: string;
}

export interface UpdateCodeProjectRequest {
    project_name?: string;
    code_url?: string;
    pipeline_url?: string;
    deploy_url?: string;
    data_url?: string;
}


export interface AccountPassword {
    id: string;
    account: string;
    password: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface CreateAccountPasswordRequest {
    account: string;
    password: string;
    description: string;
}

export interface UpdateAccountPasswordRequest {
    account?: string;
    password?: string;
    description?: string;
}
