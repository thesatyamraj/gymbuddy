import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgb(var(--surface))',
            color: 'rgb(var(--slate-900))',
            borderRadius: '12px',
            padding: '12px 20px',
            fontSize: '14px',
            fontFamily: "'DM Sans', Inter, system-ui, sans-serif",
            border: '1px solid rgb(var(--slate-200))',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#e24b4a', secondary: '#ffffff' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
