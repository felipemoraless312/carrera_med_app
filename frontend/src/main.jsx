// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Bloquear Ctrl+U, F12, Ctrl+Shift+I y clic derecho
window.addEventListener('keydown', function(e) {
  // Ctrl+U
  if (e.ctrlKey && e.key.toLowerCase() === 'u') {
    e.preventDefault();
  }
  // F12
  if (e.key === 'F12') {
    e.preventDefault();
  }
  // Ctrl+Shift+I
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') {
    e.preventDefault();
  }
});
window.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});