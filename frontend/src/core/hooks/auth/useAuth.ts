import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../../services/api/auth.api';
import { storageService } from '../../services/cache/storage.service';
import { User, LoginDto } from '../../api/model';
import { ROUTES } from '../../constants/routes.constants';
import { useToast } from '../ui/useToast';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../constants';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = storageService.getAccessToken();
      
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await authAPI.getProfile();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      storageService.clearAuth();
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginDto) => {
    try {
      const response = await authAPI.login(credentials);
      const { accessToken, refreshToken, user } = response.data;

      storageService.setAccessToken(accessToken);
      storageService.setRefreshToken(refreshToken);
      storageService.setUser(user);

      setUser(user);
      setIsAuthenticated(true);
      
      showSuccess(SUCCESS_MESSAGES.LOGIN_SUCCESS);
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      showError(ERROR_MESSAGES.INVALID_CREDENTIALS);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      storageService.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
      
      showSuccess(SUCCESS_MESSAGES.LOGOUT_SUCCESS);
      router.push(ROUTES.LOGIN);
    } catch (error) {
      showError(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };
}