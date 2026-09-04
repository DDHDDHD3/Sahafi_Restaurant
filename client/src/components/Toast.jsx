import React from 'react';

export const Toast = ({ message }) => {
  if (!message) return null;
  return (
    <div id="toast" role="status" aria-live="polite">
      <span>{message}</span>
    </div>
  );
};

export default Toast;
