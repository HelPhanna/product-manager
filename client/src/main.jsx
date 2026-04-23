// ============================================================
// 📁 src/main.jsx  (updated — wraps app with BrowserRouter)
//
// BrowserRouter is the foundation for react-router-dom.
// It watches the browser's URL bar and tells the router
// which page to show.
//
// WHY wrap here and not inside App.jsx?
// BrowserRouter needs to wrap EVERYTHING that uses routing.
// Putting it in main.jsx means every component in the tree
// can use useNavigate, useLocation, <Link>, etc.
// ============================================================

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './app/App.jsx'
import './shared/styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BrowserRouter gives every child component access to routing */}
    <BrowserRouter>
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
          error:   { iconTheme: { primary: '#fb7185', secondary: '#07070f' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
