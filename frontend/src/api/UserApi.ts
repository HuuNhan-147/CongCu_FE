import api from "../config/axios";
import type {
  AuthResponse,
  BasicApiResponse,
  RegisterResponse,
  User,
  UserUpdatePayload,
} from "../types/User";

type ApiRecord = Record<string, unknown>;

const asRecord = (value: unknown): ApiRecord => {
  if (value && typeof value === "object") {
    return value as ApiRecord;
  }

  return {};
};

const toStringValue = (value: unknown, fallback = "") => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
};

const toOptionalDate = (value: unknown) => {
  if (typeof value === "string" || value instanceof Date) {
    return value;
  }

  return undefined;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const payload = asRecord(error);
  const response = asRecord(payload.response);
  const data = asRecord(response.data);

  return toStringValue(data.message, fallback);
};

const normalizeUser = (value: unknown): User => {
  const payload = asRecord(value);
  const userId = toStringValue(payload.id || payload._id);

  return {
    id: userId,
    _id: toStringValue(payload._id, userId),
    name: toStringValue(payload.name),
    email: toStringValue(payload.email),
    phone: toStringValue(payload.phone),
    isAdmin: Boolean(payload.isAdmin),
    resetPasswordToken: toStringValue(payload.resetPasswordToken, "") || null,
    resetPasswordExpires: toOptionalDate(payload.resetPasswordExpires) || null,
    createdAt: toOptionalDate(payload.createdAt),
    updatedAt: toOptionalDate(payload.updatedAt),
  };
};

const resolveToken = (value: unknown) => {
  const payload = asRecord(value);

  return (
    toStringValue(payload.token) ||
    toStringValue(payload.accessToken) ||
    toStringValue(payload.access_token)
  );
};

const normalizeMessage = (
  value: unknown,
  fallback: string
): BasicApiResponse => {
  const payload = asRecord(value);

  return {
    message: toStringValue(payload.message, fallback),
    success:
      typeof payload.success === "boolean" ? payload.success : undefined,
  };
};

const normalizeAuthResponse = (
  value: unknown,
  fallbackMessage: string,
  requireAuthData = false
): AuthResponse => {
  const payload = asRecord(value);
  const nestedData = asRecord(payload.data);
  const userSource = payload.user || nestedData.user || payload.newUser;
  const token = resolveToken(payload) || resolveToken(nestedData);
  const user = normalizeUser(userSource);

  if (requireAuthData && (!token || !user.id)) {
    throw new Error("Phản hồi đăng nhập không hợp lệ.");
  }

  return {
    user,
    token,
    accessToken: token,
    message: toStringValue(payload.message, fallbackMessage),
  };
};

const normalizeRegisterResponse = (
  value: unknown,
  fallbackMessage: string
): RegisterResponse => {
  const payload = asRecord(value);
  const nestedData = asRecord(payload.data);
  const userSource = payload.user || nestedData.user || payload.newUser;
  const token = resolveToken(payload) || resolveToken(nestedData);

  return {
    message: toStringValue(payload.message, fallbackMessage),
    user: userSource ? normalizeUser(userSource) : undefined,
    token: token || undefined,
    accessToken: token || undefined,
  };
};

const normalizeUsers = (value: unknown): User[] => {
  if (Array.isArray(value)) {
    return value.map(normalizeUser);
  }

  const payload = asRecord(value);

  if (Array.isArray(payload.users)) {
    return payload.users.map(normalizeUser);
  }

  if (Array.isArray(payload.data)) {
    return payload.data.map(normalizeUser);
  }

  return [];
};

const normalizeSingleUser = (value: unknown): User => {
  const payload = asRecord(value);

  if (payload.user || payload.data) {
    return normalizeUser(payload.user || payload.data);
  }

  return normalizeUser(value);
};

export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await api.post("/users/login", { email, password });

    return normalizeAuthResponse(
      response.data,
      "Đăng nhập thành công.",
      true
    );
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Đăng nhập thất bại!"));
  }
};

export const registerUser = async (
  email: string,
  password: string,
  name: string,
  phone: string
): Promise<RegisterResponse> => {
  try {
    const response = await api.post("/users/register", {
      email,
      password,
      name,
      phone,
    });

    return normalizeRegisterResponse(response.data, "Tạo tài khoản thành công.");
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Tạo tài khoản thất bại!"));
  }
};

export const forgotPassword = async (
  email: string
): Promise<BasicApiResponse> => {
  try {
    const response = await api.post("/users/forgot-password", { email });

    return normalizeMessage(response.data, "Đã gửi email đặt lại mật khẩu.");
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Lỗi khi gửi yêu cầu quên mật khẩu!")
    );
  }
};

export const resetPassword = async (
  resetToken: string,
  newPassword: string
): Promise<BasicApiResponse> => {
  try {
    const response = await api.post(`/users/reset-password/${resetToken}`, {
      password: newPassword,
    });

    return normalizeMessage(response.data, "Đặt lại mật khẩu thành công.");
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Lỗi khi thay đổi mật khẩu!"));
  }
};

export const updatePassword = async (
  oldPassword: string,
  newPassword: string,
  token: string
): Promise<BasicApiResponse> => {
  try {
    const response = await api.put(
      "/users/update-password",
      { oldPassword, newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return normalizeMessage(response.data, "Cập nhật mật khẩu thành công.");
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Cập nhật mật khẩu thất bại!"));
  }
};

export const updateUserProfile = async (
  updatedData: UserUpdatePayload,
  token: string
): Promise<User> => {
  try {
    const response = await api.put("/users/profile", updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return normalizeSingleUser(response.data);
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Cập nhật thông tin thất bại!"));
  }
};

export const getAllUsers = async (token: string): Promise<User[]> => {
  try {
    const response = await api.get("/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return normalizeUsers(response.data);
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Lấy danh sách người dùng thất bại!")
    );
  }
};

export const updateUserByAdmin = async (
  userId: string,
  updatedData: UserUpdatePayload,
  token: string
): Promise<User> => {
  try {
    const response = await api.put(`/users/${userId}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return normalizeSingleUser(response.data);
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Cập nhật người dùng thất bại!"));
  }
};

export const deleteUser = async (
  userId: string,
  token: string
): Promise<BasicApiResponse> => {
  try {
    const response = await api.delete(`/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return normalizeMessage(response.data, "Xóa người dùng thành công.");
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Xóa người dùng thất bại!"));
  }
};

export const getUserById = async (
  userId: string,
  token: string
): Promise<User> => {
  try {
    const response = await api.get(`/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return normalizeSingleUser(response.data);
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Lấy thông tin người dùng thất bại!")
    );
  }
};

export const searchUsers = async (
  query: string,
  token: string
): Promise<User[]> => {
  try {
    const response = await api.get(
      `/users/search?query=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return normalizeUsers(response.data);
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Lỗi khi tìm kiếm người dùng!"));
  }
};

export const getUserProfile = async (token: string): Promise<User> => {
  try {
    const response = await api.get("/users/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return normalizeSingleUser(response.data);
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Không thể lấy thông tin người dùng!")
    );
  }
};
