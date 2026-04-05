import React, { useState, useEffect } from "react";
import { X, User as UserIcon, Edit3, Save, XCircle, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getUserProfile, updateUserProfile } from "../../api/UserApi";
import { User } from "../../types/User";

interface UserProfileProps {
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
}

type SaveStatus = "idle" | "loading" | "success" | "error";

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { token, login } = useAuth();

  const [profileData, setProfileData] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({ name: "", email: "", phone: "" });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  // ─── Bước 1: useEffect gọi getUserProfile khi component mount ───────────
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      setIsLoadingProfile(true);
      setFetchError(null);

      try {
        const data = await getUserProfile(token);
        setProfileData(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });
      } catch (err: any) {
        setFetchError(err.message || "Không thể tải thông tin người dùng.");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [token]);

  // ─── Bước 2: handleSave → updateUserProfile API → reload + update global state
  const handleSave = async () => {
    if (!token || !profileData) return;
    setSaveStatus("loading");
    setSaveError(null);

    try {
      const updatedUser = await updateUserProfile(
        { name: formData.name, email: formData.email, phone: formData.phone },
        token
      );

      // Cập nhật local state để reload UI
      setProfileData(updatedUser);
      setFormData({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
      });

      // Đồng bộ lên global AuthContext (update user toàn app)
      login(updatedUser, token);

      setSaveStatus("success");
      setIsEditing(false);

      // Reset trạng thái thành công sau 2s
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err: any) {
      setSaveStatus("error");
      setSaveError(err.message || "Cập nhật thất bại. Vui lòng thử lại.");
    }
  };

  const handleCancelEdit = () => {
    if (!profileData) return;
    // Khôi phục lại form về data gốc khi hủy bỏ
    setFormData({
      name: profileData.name || "",
      email: profileData.email || "",
      phone: profileData.phone || "",
    });
    setSaveError(null);
    setSaveStatus("idle");
    setIsEditing(false);
  };

  // ─── Render: Loading State ───────────────────────────────────────────────
  if (isLoadingProfile) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-blue-600" />
          <p className="text-gray-500 text-sm">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  // ─── Render: Fetch Error State ───────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
          <XCircle size={40} className="text-red-500 mx-auto mb-3" />
          <p className="text-red-600 font-medium mb-4">{fetchError}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  // ─── Render: Profile Modal ───────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

        {/* Header Modal */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
              <UserIcon size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-base leading-tight">
                {profileData?.name}
              </h2>
              <p className="text-gray-400 text-xs">{profileData?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors rounded-full p-1 hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Thông báo thành công */}
          {saveStatus === "success" && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2.5 text-sm">
              <CheckCircle size={16} />
              <span>Cập nhật thông tin thành công!</span>
            </div>
          )}

          {/* Thông báo lỗi save */}
          {saveStatus === "error" && saveError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm">
              <XCircle size={16} />
              <span>{saveError}</span>
            </div>
          )}

          {/* Trường dữ liệu */}
          {(["name", "email", "phone"] as const).map((field) => {
            const labels: Record<string, string> = {
              name: "Họ và tên",
              email: "Email",
              phone: "Số điện thoại",
            };
            return (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  {labels[field]}
                </label>
                {isEditing ? (
                  <input
                    type={field === "email" ? "email" : "text"}
                    value={formData[field]}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={`Nhập ${labels[field].toLowerCase()}`}
                    disabled={saveStatus === "loading"}
                  />
                ) : (
                  <p className="text-sm text-gray-800 font-medium bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
                    {profileData?.[field] || <span className="text-gray-400 italic">Chưa có thông tin</span>}
                  </p>
                )}
              </div>
            );
          })}

          {/* Trường chỉ đọc */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
              Vai trò
            </label>
            <p className="text-sm font-medium bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                profileData?.isAdmin
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              }`}>
                {profileData?.isAdmin ? "Quản trị viên" : "Khách hàng"}
              </span>
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-6 pb-5 flex gap-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
              >
                <Edit3 size={16} />
                Cập nhật
              </button>
              <button
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
              >
                Đóng
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={saveStatus === "loading"}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
              >
                {saveStatus === "loading" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saveStatus === "loading" ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={saveStatus === "loading"}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
              >
                <XCircle size={16} />
                Hủy
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
