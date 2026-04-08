import React, { useEffect } from 'react';

const Notification = ({ 
  type = 'info', 
  message, 
  onClose, 
  autoClose = true, 
  duration = 5000,
  className = '' 
}) => {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`notification ${type} ${className}`} onClick={onClose}>
      <span>
        {getIcon()} {message}
      </span>
      {onClose && (
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
};

export default Notification;
