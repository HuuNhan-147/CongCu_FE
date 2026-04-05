import React from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

const OrdersButton: React.FC = () => {
  return (
    <Link 
      to="/orders" 
      className="text-gray-300 hover:text-white transition-colors flex items-center"
      title="Đơn hàng của tôi"
    >
      <Package size={24} />
      <span className="hidden md:block ml-1 text-sm font-medium">Đơn hàng</span>
    </Link>
  );
};

export default OrdersButton;
