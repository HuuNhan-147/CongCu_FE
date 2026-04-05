import React from 'react';
import { Phone, Mail } from 'lucide-react';

const ContactInfo: React.FC = () => {
  return (
    <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-400">
      <div className="flex items-center">
        <Phone size={16} className="mr-1" />
        <span>1900 1234</span>
      </div>
      <div className="flex items-center">
        <Mail size={16} className="mr-1" />
        <span>support@nodexstore.com</span>
      </div>
    </div>
  );
};

export default ContactInfo;
