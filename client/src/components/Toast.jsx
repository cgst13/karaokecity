import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500';
  const Icon = type === 'success' ? FaCheckCircle : FaExclamationCircle;

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${bgColor} ${textColor} animate-slide-in-right max-w-sm w-full transform transition-all`}>
      <Icon className={`flex-shrink-0 text-xl ${iconColor}`} />
      <p className="flex-1 font-medium text-sm">{message}</p>
      <button 
        onClick={onClose}
        className={`p-1 rounded-full hover:bg-black/5 transition-colors ${textColor} opacity-60 hover:opacity-100`}
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default Toast;
