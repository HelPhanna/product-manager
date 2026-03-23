import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#0e0e23',
          color: '#e2e2ef',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          fontSize: '13px',
          fontFamily: 'Sora, sans-serif',
        },
        success: { iconTheme: { primary: '#4ade80', secondary: '#07070f' } },
        error: { iconTheme: { primary: '#fb7185', secondary: '#07070f' } },
      }}
    />
  </React.StrictMode>,
)
