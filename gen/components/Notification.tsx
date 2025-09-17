import React, { useEffect, useState } from 'react';
import { ICONS } from '../constants';

interface NotificationProps {
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
      // Allow time for fade-out animation before calling onClose
      setTimeout(onClose, 300);
    }, 4700);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 transition-all duration-300 ease-in-out ${
        show ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
      }`}
    >
      <div className="glass-card border border-secondary rounded-lg shadow-2xl p-4 flex items-start space-x-4 max-w-sm">
        <div className="flex-shrink-0 text-secondary">
          {React.cloneElement(ICONS.SPARKLES, { className: 'w-6 h-6' })}
        </div>
        <div className="flex-grow">
          <p className="font-bold text-foreground">New Achievement!</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <button
          onClick={() => {
            setShow(false);
            setTimeout(onClose, 300);
          }}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {React.cloneElement(ICONS.X, { className: 'w-5 h-5' })}
        </button>
      </div>
    </div>
  );
};

export default Notification;