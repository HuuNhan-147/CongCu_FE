import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, LogOut, Settings } from 'lucide-react';
import { User } from '../../types/User';

interface AuthButtonsProps {
  user: User | null;
  token: string | null;
  onAutoLogout: (message: string) => void;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ user, token, onAutoLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user || !token) {
    return (
      <div className="flex items-center space-x-2 md:space-x-3">
        <Link 
          to="/login" 
          className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          Đăng nhập
        </Link>
        <Link 
          to="/register" 
          className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-md transition-colors"
        >
          Đăng ký
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-600 transition-colors">
          <UserIcon size={18} />
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-300 truncate max-w-[100px]">
          {user.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-100">
             <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
             <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <Link 
            to="/profile" 
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Settings size={16} className="mr-2 text-gray-500" />
            Tài khoản
          </Link>
          <button 
            onClick={() => {
              setIsOpen(false);
              onAutoLogout("Bạn đã đăng xuất thành công!");
            }}
            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} className="mr-2" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthButtons;
