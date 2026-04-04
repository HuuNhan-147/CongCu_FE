import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, SendHorizontal } from "lucide-react";
import { forgotPassword } from "../api/UserApi";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      setSuccess("");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email không đúng định dạng.");
      setSuccess("");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await forgotPassword(email.trim());
      setSuccess(
        response.message ||
          "Yêu cầu đã được gửi. Vui lòng kiểm tra email để tiếp tục."
      );
      setEmail("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể gửi yêu cầu quên mật khẩu."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#0f172a_0%,#1e293b_45%,#dbeafe_100%)] px-4 py-10">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl md:grid md:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-slate-950 p-8 text-white">
          <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-sm text-cyan-200">
            Khôi phục mật khẩu
          </span>
          <h1 className="mt-6 text-4xl font-black leading-tight">
            Nhập email để nhận liên kết đặt lại mật khẩu.
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Trang này chỉ gửi yêu cầu reset password. Link đặt lại mật khẩu sẽ
            phụ thuộc vào cấu hình backend và email service hiện tại.
          </p>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              <SendHorizontal size={16} />
              Forgot Password
            </span>
            <h2 className="mt-4 text-3xl font-black text-slate-900">
              Gửi yêu cầu khôi phục
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Chúng tôi sẽ gửi liên kết đặt lại mật khẩu qua email của bạn.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Mail size={18} className="text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-sm outline-none"
                />
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
              <SendHorizontal size={18} />
              {loading ? "Đang gửi yêu cầu..." : "Gửi liên kết"}
            </button>
          </form>

          <div className="mt-6 text-sm text-slate-500">
            <Link
              to="/login"
              className="font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Quay lại trang đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
