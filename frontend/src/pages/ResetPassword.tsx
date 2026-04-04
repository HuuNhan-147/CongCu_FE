import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff, KeyRound, RotateCcw } from "lucide-react";
import { resetPassword } from "../api/UserApi";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { resetToken } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!resetToken) {
      setError("Liên kết đặt lại mật khẩu không hợp lệ.");
      return;
    }

    if (!password.trim() || !confirmPassword.trim()) {
      setError("Vui lòng nhập đầy đủ mật khẩu mới.");
      setSuccess("");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      setSuccess("");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      setSuccess("");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await resetPassword(resetToken, password);
      setSuccess(response.message || "Đặt lại mật khẩu thành công.");
      setPassword("");
      setConfirmPassword("");

      window.setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1400);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể đặt lại mật khẩu."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(155deg,#ecfeff_0%,#e0e7ff_50%,#0f172a_100%)] px-4 py-10">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl md:grid md:grid-cols-[1fr_1fr]">
        <div className="bg-slate-900 p-8 text-white">
          <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-sm text-cyan-200">
            Reset Password
          </span>
          <h1 className="mt-6 text-4xl font-black leading-tight">
            Thiết lập mật khẩu mới cho tài khoản của bạn.
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Liên kết này sử dụng `resetToken` từ URL và chỉ hợp lệ khi backend
            còn chấp nhận token khôi phục.
          </p>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
              <RotateCcw size={16} />
              Đặt lại mật khẩu
            </span>
            <h2 className="mt-4 text-3xl font-black text-slate-900">
              Nhập mật khẩu mới
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Mật khẩu mới sẽ thay thế mật khẩu cũ ngay sau khi cập nhật thành
              công.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Mật khẩu mới
              </span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <KeyRound size={18} className="text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
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
                Xác nhận mật khẩu mới
              </span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <KeyRound size={18} className="text-slate-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
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
              <RotateCcw size={18} />
              {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
            </button>
          </form>

          <div className="mt-6 text-sm text-slate-500">
            <Link
              to="/login"
              className="font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
