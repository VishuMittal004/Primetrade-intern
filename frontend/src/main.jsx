import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'rgba(8, 8, 22, 0.9)',
          backdropFilter: 'blur(20px)',
          color: '#f0f4ff',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          fontSize: '13px',
          fontFamily: "'Inter', sans-serif",
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
        },
        success: {
          iconTheme: { primary: '#00e5a0', secondary: 'rgba(8,8,22,0.9)' },
        },
        error: {
          iconTheme: { primary: '#ff4466', secondary: 'rgba(8,8,22,0.9)' },
        },
        duration: 4000,
      }}
    />
  </React.StrictMode>
);
