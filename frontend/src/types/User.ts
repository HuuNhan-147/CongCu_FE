export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: string | Date | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AuthResponse {
  user: User;
  token: string;
  accessToken: string;
  message?: string;
}

export interface RegisterResponse {
  message: string;
  user?: User;
  token?: string;
  accessToken?: string;
}

export interface BasicApiResponse {
  message: string;
  success?: boolean;
}

export interface UserUpdatePayload {
  name?: string;
  email?: string;
  phone?: string;
  isAdmin?: boolean;
}
