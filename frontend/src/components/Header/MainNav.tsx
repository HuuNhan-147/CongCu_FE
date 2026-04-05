import React from 'react';
import { Link } from 'react-router-dom';

interface MainNavProps {
  onViewProducts: () => void;
}

const MainNav: React.FC<MainNavProps> = ({ onViewProducts }) => {
  return (
    <nav className="hidden md:flex space-x-6">
      <Link to="/" className="text-gray-300 hover:text-white font-medium transition-colors">
        Trang chủ
      </Link>
      <button 
        onClick={onViewProducts}
        className="text-gray-300 hover:text-white font-medium transition-colors text-left focus:outline-none"
      >
        Sản phẩm
      </button>
      <Link to="/about" className="text-gray-300 hover:text-white font-medium transition-colors">
        Giới thiệu
      </Link>
    </nav>
  );
};

export default MainNav;
