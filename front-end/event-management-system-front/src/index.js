import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { initKeycloak } from './keycloak';

const root = ReactDOM.createRoot(document.getElementById('root'));

async function bootstrap() {
  try {
    await initKeycloak();
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (e) {
    console.error('Keycloak init failed', e);
    // Optional: show a fallback UI / retry
  }
}

bootstrap();
reportWebVitals();
