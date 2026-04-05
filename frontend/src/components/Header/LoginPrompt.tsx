import React from "react";
import { Link } from "react-router-dom";
import { X, LogIn, ShoppingCart } from "lucide-react";

interface LoginPromptProps {
  onClose: () => void;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ onClose }) => {
  return (
    // Overlay mờ phía sau
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center px-4 pb-6 sm:pb-0"
      onClick={onClose}
    >
      {/* Popup nhỏ - stopPropagation để click bên trong không đóng */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng X */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
          aria-label="Đóng"
        >
          <X size={18} />
        </button>

        {/* Icon minh họa */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
              <ShoppingCart size={28} className="text-blue-500" />
            </div>
            {/* Badge khóa nhỏ ở góc */}
            <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900">
              !
            </span>
          </div>
        </div>

        {/* Nội dung thông báo */}
        <div className="text-center mb-5">
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            Bạn chưa đăng nhập
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng và tiến hành mua sắm.
          </p>
        </div>

        {/* Nút hành động */}
        <div className="flex flex-col gap-2">
          <Link
            to="/login"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
          >
            <LogIn size={16} />
            Đăng nhập ngay
          </Link>
          <Link
            to="/register"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl transition-colors text-sm"
          >
            Tạo tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;
