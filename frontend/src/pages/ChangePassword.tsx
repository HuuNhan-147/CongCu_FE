import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { updatePassword } from "../api/UserApi";
import { useAuth } from "../context/AuthContext";

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { getToken, isAuthenticated, isReady } = useAuth();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", {
        replace: true,
        state: { from: { pathname: "/change-password" } },
      });
    }
  }, [isAuthenticated, isReady, navigate]);

  const togglePassword = (field: keyof typeof showPasswords) => {
    setShowPasswords((current) => ({ ...current, [field]: !current[field] }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const token = getToken();

    if (!token) {
      setError("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
      setSuccess("");
      return;
    }

    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError("Vui lòng nhập đầy đủ các trường mật khẩu.");
      setSuccess("");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      setSuccess("");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      setSuccess("");
      return;
    }

    if (oldPassword === newPassword) {
      setError("Mật khẩu mới phải khác mật khẩu cũ.");
      setSuccess("");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await updatePassword(oldPassword, newPassword, token);
      setSuccess(response.message || "Đổi mật khẩu thành công.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể đổi mật khẩu."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-sm text-slate-200">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(145deg,#eff6ff_0%,#f8fafc_45%,#dbeafe_100%)] px-4 py-10">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl md:grid md:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-slate-950 p-8 text-white">
          <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-sm text-cyan-200">
            Đổi mật khẩu
          </span>
          <h1 className="mt-6 text-4xl font-black leading-tight">
            Cập nhật mật khẩu để bảo vệ tài khoản an toàn hơn.
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Trang này yêu cầu người dùng đã đăng nhập và dùng token hiện có để
            gọi API đổi mật khẩu.
          </p>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              <ShieldCheck size={16} />
              Account Security
            </span>
            <h2 className="mt-4 text-3xl font-black text-slate-900">
              Thay đổi mật khẩu
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Hãy nhập đúng mật khẩu hiện tại trước khi lưu mật khẩu mới.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <PasswordField
              label="Mật khẩu hiện tại"
              placeholder="Nhập mật khẩu hiện tại"
              value={oldPassword}
              visible={showPasswords.oldPassword}
              onChange={setOldPassword}
              onToggle={() => togglePassword("oldPassword")}
            />

            <PasswordField
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              visible={showPasswords.newPassword}
              onChange={setNewPassword}
              onToggle={() => togglePassword("newPassword")}
            />

            <PasswordField
              label="Xác nhận mật khẩu mới"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              visible={showPasswords.confirmPassword}
              onChange={setConfirmPassword}
              onToggle={() => togglePassword("confirmPassword")}
            />

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
              <ShieldCheck size={18} />
              {loading ? "Đang cập nhật..." : "Lưu mật khẩu mới"}
            </button>
          </form>

          <div className="mt-6 text-sm text-slate-500">
            <Link
              to="/forgot-password"
              className="font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PasswordFieldProps {
  label: string;
  placeholder: string;
  value: string;
  visible: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  placeholder,
  value,
  visible,
  onChange,
  onToggle,
}) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-slate-700">
      {label}
    </span>
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <KeyRound size={18} className="text-slate-400" />
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm outline-none"
      />
      <button
        type="button"
        className="text-slate-400 transition hover:text-slate-700"
        onClick={onToggle}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </label>
);

export default ChangePassword;
