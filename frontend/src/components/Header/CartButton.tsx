import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface CartButtonProps {
  token: string | null;
}

const CartButton: React.FC<CartButtonProps> = ({ token }) => {
  const { getCartItemCount, fetchCart } = useCart();
  const itemCount = getCartItemCount();

  // Gọi api update dữ liệu mỗi khi token mount
  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token, fetchCart]);

  return (
    <Link 
      to="/cart" 
      className="relative text-gray-300 hover:text-white transition-colors flex items-center"
      title="Giỏ hàng"
    >
      <ShoppingCart size={24} />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
};

export default CartButton;
