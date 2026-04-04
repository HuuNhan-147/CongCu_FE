import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, LogIn, Mail } from "lucide-react";
import { loginUser } from "../api/UserApi";
import { useAuth } from "../context/AuthContext";

const resolveRedirectPath = (isAdmin: boolean, pathname?: string) => {
  if (pathname && pathname !== "/login" && pathname !== "/register") {
    return pathname;
  }

  return isAdmin ? "/admin" : "/";
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isReady, login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fromPath = (
    location.state as { from?: { pathname?: string } } | null
  )?.from?.pathname;

  useEffect(() => {
    if (!isReady || !isAuthenticated) {
      return;
    }

    navigate(resolveRedirectPath(Boolean(user?.isAdmin), fromPath), {
      replace: true,
    });
  }, [fromPath, isAuthenticated, isReady, navigate, user?.isAdmin]);

  const validateForm = () => {
    if (!email.trim() || !password.trim()) {
      return "Vui lòng nhập đầy đủ email và mật khẩu.";
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Email không đúng định dạng.";
    }

    return "";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await loginUser(email.trim(), password);

      login(response.user, response.token);
      navigate(resolveRedirectPath(response.user.isAdmin, fromPath), {
        replace: true,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Đăng nhập thất bại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.35),_transparent_40%),linear-gradient(135deg,_#0f172a,_#020617)] p-10 md:flex md:flex-col md:justify-between">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.06)_35%,transparent_70%)]" />
          <div className="relative">
            <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-sm text-cyan-200">
              Khu vực người dùng
            </span>
            <h1 className="mt-6 max-w-md text-4xl font-black leading-tight">
              Đăng nhập để tiếp tục quản lý tài khoản và truy cập an toàn.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300">
              Giao diện này kết nối trực tiếp với luồng xác thực hiện có và
              chuyển hướng phù hợp cho tài khoản người dùng hoặc admin.
            </p>
          </div>

          <div className="relative grid gap-4 text-sm text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Đăng nhập bằng email và mật khẩu đã đăng ký.
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Tự động lưu phiên làm việc thông qua `AuthContext`.
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Điều hướng về trang admin nếu tài khoản có quyền quản trị.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center bg-white px-6 py-10 text-slate-900 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                <LogIn size={16} />
                Đăng nhập
              </span>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
                Chào mừng quay lại
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Nhập thông tin tài khoản để tiếp tục.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-500 focus-within:bg-white">
                  <Mail size={18} className="text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent text-sm outline-none"
                    autoComplete="email"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Mật khẩu
                </span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-500 focus-within:bg-white">
                  <LockKeyhole size={18} className="text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full bg-transparent text-sm outline-none"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="text-slate-400 transition hover:text-slate-700"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              ) : null}

              <div className="flex items-center justify-between text-sm">
                <Link
                  to="/forgot-password"
                  className="font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Quên mật khẩu?
                </Link>
                <Link
                  to="/register"
                  className="font-semibold text-slate-600 transition hover:text-slate-900"
                >
                  Tạo tài khoản mới
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <LogIn size={18} />
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
