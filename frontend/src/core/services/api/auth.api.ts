import { ApiClient } from '../http/apiClient';
import { LoginDto, User } from '../../api/model';

class AuthAPI extends ApiClient {
  constructor() {
    super('/auth');
  }

  async login(credentials: LoginDto) {
    return this.post<{ accessToken: string; refreshToken: string; user: User }>(
      '/login',
      credentials
    );
  }

  async logout() {
    return this.post('/logout');
  }

  async refresh(refreshToken: string) {
    return this.post<{ accessToken: string }>('/refresh', { refreshToken });
  }

  async getProfile() {
    return this.get<User>('/me');
  }

  async verifyToken(token: string) {
    return this.post<User>('/verify', { token });
  }
}

export const authAPI = new AuthAPI();