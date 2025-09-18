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

window.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.key.toLowerCase() === 'u') {
    e.preventDefault();
  }
  if (e.key === 'F12') {
    e.preventDefault();
  }
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') {
    e.preventDefault();
  }
});
window.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});