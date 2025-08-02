import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1F2937',
          color: '#F9FAFB',
          border: '1px solid #374151',
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: '#F9FAFB',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#F9FAFB',
          },
        },
      }}
    />
  </StrictMode>
);
