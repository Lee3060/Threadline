import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // global tokens first, so feature CSS can override shared classes
import App from './app/App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
