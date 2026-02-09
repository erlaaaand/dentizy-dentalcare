import { apiClient } from './api-client';
import type { AxiosRequestConfig } from 'axios';

export class RequestBuilder {
  private config: AxiosRequestConfig = {};

  method(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'): this {
    this.config.method = method;
    return this;
  }

  url(url: string): this {
    this.config.url = url;
    return this;
  }

  data(data: unknown): this {
    this.config.data = data;
    return this;
  }

  params(params: Record<string, unknown>): this {
    this.config.params = params;
    return this;
  }

  headers(headers: Record<string, string>): this {
    this.config.headers = { ...this.config.headers, ...headers };
    return this;
  }

  async execute<T>() {
    return apiClient.request<T>(this.config);
  }
}

export const createRequest = () => new RequestBuilder();