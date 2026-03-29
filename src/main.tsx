import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './style.css';

// Cache-busting deploy: 2026-03-29-12-46
console.log('Datalyse main.tsx loaded - Version 1.0.8');

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
