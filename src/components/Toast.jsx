import React from 'react';

export default function Toast({ message, kind = 'success' }) {
  if (!message) return null;
  const styles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    warn: 'bg-amber-50 text-amber-800 border-amber-200'
  };
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg border text-sm shadow-sm ${styles[kind]}`}>
      {message}
    </div>
  );
}
