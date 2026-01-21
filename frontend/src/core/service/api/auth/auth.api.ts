import { 
  authControllerLogin, 
  authControllerLogout, 
  authControllerGetProfile,
  authControllerVerify,
  authControllerUpdateMyProfile
} from '../../../api/generated/auth/auth';
import { LoginDto, UpdateProfileDto, VerifyTokenDto } from '../../../types/auth/auth.types';

export const AuthService = {
  login: async (data: LoginDto) => {
    const response = await authControllerLogin(data);
    return response;
  },

  logout: async () => {
    return await authControllerLogout();
  },

  getProfile: async () => {
    return await authControllerGetProfile();
  },

  verifyToken: async (data: VerifyTokenDto) => {
    return await authControllerVerify(data);
  },

  updateProfile: async (data: UpdateProfileDto) => {
    return await authControllerUpdateMyProfile(data);
  }
};