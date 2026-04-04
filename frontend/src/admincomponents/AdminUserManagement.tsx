import React, { useEffect, useMemo, useState } from "react";
import { Search, Shield, Trash2, UserCog, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  deleteUser,
  getAllUsers,
  searchUsers,
  updateUserByAdmin,
} from "../api/UserApi";
import { useAuth } from "../context/AuthContext";
import type { User } from "../types/User";

const createEditState = (user: User) => ({
  name: user.name || "",
  email: user.email || "",
  phone: user.phone || "",
  isAdmin: Boolean(user.isAdmin),
});

const formatDate = (value?: string | Date) => {
  if (!value) {
    return "Chưa có";
  }

  const parsedDate = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Chưa có";
  }

  return parsedDate.toLocaleString("vi-VN");
};

const resolveUserId = (user: User) => user.id || user._id || "";

const AdminUserManagement: React.FC = () => {
  const navigate = useNavigate();
  const { getToken, isAdmin, isAuthenticated, isReady } = useAuth();
  const authToken = getToken();

  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    isAdmin: false,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const totalAdmins = useMemo(
    () => users.filter((user) => user.isAdmin).length,
    [users]
  );

  const loadUsers = async (token: string, query = "") => {
    if (!token) {
      setError("Phiên đăng nhập không hợp lệ.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = query.trim()
        ? await searchUsers(query.trim(), token)
        : await getAllUsers(token);

      setUsers(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải danh sách người dùng."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!isAuthenticated || !authToken) {
      navigate("/login", {
        replace: true,
        state: { from: { pathname: "/admin/users" } },
      });
      return;
    }

    if (!isAdmin) {
      navigate("/", { replace: true });
      return;
    }

    void loadUsers(authToken);
  }, [authToken, isAdmin, isAuthenticated, isReady, navigate]);

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");

    if (!authToken) {
      setError("Phiên đăng nhập không hợp lệ.");
      return;
    }

    await loadUsers(authToken, searchQuery);
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setEditForm(createEditState(user));
    setError("");
    setNotice("");
  };

  const handleRefresh = async () => {
    setSearchQuery("");
    setSelectedUser(null);
    setNotice("");

    if (!authToken) {
      setError("Phiên đăng nhập không hợp lệ.");
      return;
    }

    await loadUsers(authToken);
  };

  const handleSave = async () => {
    if (!selectedUser) {
      setError("Vui lòng chọn người dùng cần cập nhật.");
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Phiên đăng nhập không hợp lệ.");
      return;
    }

    if (!editForm.name.trim() || !editForm.email.trim()) {
      setError("Tên và email không được để trống.");
      return;
    }

    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      const updatedUser = await updateUserByAdmin(
        resolveUserId(selectedUser),
        {
          name: editForm.name.trim(),
          email: editForm.email.trim(),
          phone: editForm.phone.trim(),
          isAdmin: editForm.isAdmin,
        },
        token
      );

      setUsers((current) =>
        current.map((user) =>
          resolveUserId(user) === resolveUserId(updatedUser) ? updatedUser : user
        )
      );
      setSelectedUser(updatedUser);
      setEditForm(createEditState(updatedUser));
      setNotice("Cập nhật người dùng thành công.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể cập nhật người dùng."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user: User) => {
    const userId = resolveUserId(user);
    const token = getToken();

    if (!token || !userId) {
      setError("Không thể xác định người dùng cần xóa.");
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa người dùng "${user.name}" không?`
    );

    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      await deleteUser(userId, token);
      setUsers((current) =>
        current.filter((item) => resolveUserId(item) !== userId)
      );

      if (selectedUser && resolveUserId(selectedUser) === userId) {
        setSelectedUser(null);
      }

      setNotice("Xóa người dùng thành công.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể xóa người dùng."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-sm text-slate-200">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#e2e8f0_0%,#f8fafc_40%,#dbeafe_100%)] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-2xl">
          <div className="grid gap-6 p-8 md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-sm text-cyan-200">
                Admin User Management
              </span>
              <h1 className="mt-5 text-4xl font-black leading-tight">
                Quản lý danh sách người dùng và quyền truy cập trong hệ thống.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                Màn hình này hỗ trợ xem danh sách, tìm kiếm, chỉnh sửa thông tin
                cơ bản và cập nhật quyền admin cho từng tài khoản.
              </p>
            </div>

            <div className="grid gap-4 text-sm text-slate-200">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Tổng người dùng: <strong>{users.length}</strong>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Tài khoản admin: <strong>{totalAdmins}</strong>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Tài khoản thường: <strong>{users.length - totalAdmins}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Danh sách người dùng
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Tìm kiếm và thao tác trực tiếp trên dữ liệu người dùng.
                </p>
              </div>

              <form
                className="flex w-full max-w-xl gap-3"
                onSubmit={handleSearch}
              >
                <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Search size={18} className="text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Tìm theo tên hoặc email"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Tìm
                </button>
                <button
                  type="button"
                  onClick={() => void handleRefresh()}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Làm mới
                </button>
              </form>
            </div>

            {error ? (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            {notice ? (
              <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {notice}
              </div>
            ) : null}

            {loading ? (
              <div className="flex min-h-64 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                Đang tải danh sách người dùng...
              </div>
            ) : users.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500">
                <Users className="mb-4 text-slate-300" size={40} />
                Không tìm thấy người dùng phù hợp.
              </div>
            ) : (
              <div className="grid gap-4">
                {users.map((user) => {
                  const currentUserId = resolveUserId(user);
                  const active = selectedUser
                    ? resolveUserId(selectedUser) === currentUserId
                    : false;

                  return (
                    <button
                      key={currentUserId}
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      className={`w-full rounded-3xl border p-5 text-left transition ${
                        active
                          ? "border-blue-200 bg-blue-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-bold text-slate-900">
                              {user.name || "Người dùng chưa có tên"}
                            </h3>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                user.isAdmin
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {user.isAdmin ? "Admin" : "User"}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">{user.email}</p>
                          <p className="text-sm text-slate-500">
                            SĐT: {user.phone || "Chưa cập nhật"}
                          </p>
                        </div>

                        <div className="flex flex-col items-start gap-3 text-sm text-slate-500 lg:items-end">
                          <span>Tạo lúc: {formatDate(user.createdAt)}</span>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleDelete(user);
                            }}
                            disabled={submitting}
                            className="inline-flex items-center gap-2 rounded-full border border-red-200 px-3 py-2 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 size={16} />
                            Xóa
                          </button>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900">
                Chỉnh sửa người dùng
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Chọn một người dùng trong danh sách để cập nhật thông tin.
              </p>
            </div>

            {!selectedUser ? (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500">
                <UserCog className="mb-4 text-slate-300" size={40} />
                Chưa có người dùng nào được chọn.
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">
                      {(selectedUser.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {selectedUser.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Cập nhật lần cuối: {formatDate(selectedUser.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Họ và tên
                  </span>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </span>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Số điện thoại
                  </span>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-slate-400" />
                    <div>
                      <div className="text-sm font-semibold text-slate-700">
                        Quyền quản trị
                      </div>
                      <div className="text-xs text-slate-500">
                        Bật nếu tài khoản này cần truy cập khu vực admin.
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={editForm.isAdmin}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        isAdmin: event.target.checked,
                      }))
                    }
                    className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <UserCog size={18} />
                  {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            )}
          </aside>
        </section>
      </div>
    </div>
  );
};

export default AdminUserManagement;
