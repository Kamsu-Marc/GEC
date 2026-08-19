import React, { useContext } from 'react';
import { DataContext } from '../../context/DataContext';

export const Toast = () => {
  const { toasts } = useContext(DataContext);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div id="toast-container">
      {toasts.map(t => (
        <div key={t.id} className="toast-message">
          <span style={{ fontSize: '1.1rem' }}>{t.icon}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
};
