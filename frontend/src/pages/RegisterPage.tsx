import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  ShieldCheck,
  UserPlus,
  UserRound,
} from "lucide-react";
import { registerUser } from "../api/UserApi";
import { useAuth } from "../context/AuthContext";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isReady, user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isReady || !isAuthenticated) {
      return;
    }

    navigate(user?.isAdmin ? "/admin" : "/", { replace: true });
  }, [isAuthenticated, isReady, navigate, user?.isAdmin]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const validateForm = () => {
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim()
    ) {
      return "Vui lòng nhập đầy đủ thông tin.";
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return "Email không đúng định dạng.";
    }

    if (formData.password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Mật khẩu xác nhận không khớp.";
    }

    return "";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await registerUser(
        formData.email.trim(),
        formData.password,
        formData.name.trim(),
        formData.phone.trim()
      );

      setSuccess(response.message || "Tạo tài khoản thành công. Hãy đăng nhập.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      window.setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Tạo tài khoản thất bại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(140deg,#f8fafc_0%,#dbeafe_45%,#eff6ff_100%)] px-4 py-10">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl md:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-between bg-slate-950 p-10 text-white">
          <div>
            <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-sm text-cyan-200">
              Đăng ký tài khoản
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight">
              Tạo tài khoản mới để bắt đầu sử dụng hệ thống.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
              Form đăng ký này bám sát `UserApi.ts`, hỗ trợ đầy đủ các trường
              cơ bản và sẵn sàng tích hợp với luồng xác thực hiện có.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Họ tên, email, số điện thoại và mật khẩu được kiểm tra trước khi
              gửi API.
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Sau khi đăng ký thành công, người dùng được đưa về trang đăng
              nhập.
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              <UserPlus size={16} />
              Register
            </span>
            <h2 className="mt-4 text-3xl font-black text-slate-900">
              Tạo tài khoản
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Điền đầy đủ thông tin để tạo tài khoản mới.
            </p>
          </div>

          <form className="grid gap-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Họ và tên
              </span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <UserRound size={18} className="text-slate-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Mail size={18} className="text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) => handleChange("email", event.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Số điện thoại
                </span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Phone size={18} className="text-slate-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(event) => handleChange("phone", event.target.value)}
                    placeholder="0901234567"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Mật khẩu
                </span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <ShieldCheck size={18} className="text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(event) =>
                      handleChange("password", event.target.value)
                    }
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full bg-transparent text-sm outline-none"
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

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Xác nhận mật khẩu
                </span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <ShieldCheck size={18} className="text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(event) =>
                      handleChange("confirmPassword", event.target.value)
                    }
                    placeholder="Nhập lại mật khẩu"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                  <button
                    type="button"
                    className="text-slate-400 transition hover:text-slate-700"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </label>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <UserPlus size={18} />
              {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            </button>

            <p className="text-center text-sm text-slate-500">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
