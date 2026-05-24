import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios'

// Cerrar sesión automáticamente al cerrar la pestaña (migración de localStorage a sessionStorage)
if (localStorage.getItem('token')) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

const getStorage = (key) => sessionStorage.getItem(key);
const setStorage = (key, val) => sessionStorage.setItem(key, val);
const removeStorage = (key) => sessionStorage.removeItem(key);

try {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: getStorage,
      setItem: setStorage,
      removeItem: removeStorage,
      clear: () => sessionStorage.clear(),
      key: (idx) => sessionStorage.key(idx),
      get length() { return sessionStorage.length; }
    },
    writable: true,
    configurable: true
  });
} catch (e) {
  localStorage.getItem = getStorage;
  localStorage.setItem = setStorage;
  localStorage.removeItem = removeStorage;
}

// Configurar URL base dinámica para axios
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
