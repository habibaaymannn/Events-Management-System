// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { initKeycloak } from './keycloak';

const root = ReactDOM.createRoot(document.getElementById('root'));

function renderFallback(message, retryFn) {
  root.render(
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
    }}>
      <div style={{
        padding: '24px 28px',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,.08)',
        maxWidth: 560,
        textAlign: 'center'
      }}>
        <h2 style={{margin: 0, color: '#c62828'}}>Authentication failed</h2>
        <p style={{marginTop: 12, opacity: .8}}>{String(message)}</p>
        <button
          onClick={retryFn}
          style={{
            marginTop: 12,
            padding: '10px 16px',
            borderRadius: 8,
            border: 0,
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function persistTokens(kc) {
  try {
    if (kc?.token) localStorage.setItem('kc-token', kc.token);
    if (kc?.refreshToken) localStorage.setItem('kc-refresh', kc.refreshToken);
  } catch (_) {
    // fallback to sessionStorage if localStorage blocked
    if (kc?.token) sessionStorage.setItem('kc-token', kc.token);
    if (kc?.refreshToken) sessionStorage.setItem('kc-refresh', kc.refreshToken);
  }
}

function wireTokenRefresh(kc) {
  // Persist whenever we (re)auth or refresh
  kc.onAuthSuccess = () => persistTokens(kc);
  kc.onAuthRefreshSuccess = () => persistTokens(kc);

  // When token is about to expire, refresh it
  kc.onTokenExpired = () => {
    kc.updateToken(30) // refresh if less than 30s remaining
      .then(() => persistTokens(kc))
      .catch(err => {
        console.error('Keycloak token refresh failed', err);
        // Optionally send to login again:
        // kc.login();
      });
  };

  // Also proactively refresh on an interval (belt & suspenders)
  setInterval(() => {
    kc.updateToken(60).then(refreshed => {
      if (refreshed) persistTokens(kc);
    }).catch(err => {
      console.warn('Periodic token check failed', err);
    });
  }, 20_000);
}

async function bootstrap() {
  try {
    const kc = await initKeycloak();        // should return/attach a Keycloak instance
    const keycloak = kc || window.keycloak; // support either style

    if (!keycloak) throw new Error('Keycloak not available after init');

    persistTokens(keycloak);
    wireTokenRefresh(keycloak);

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (e) {
    console.error('Keycloak init failed', e);
    renderFallback(e?.message || e, bootstrap);
  }
}

bootstrap();
reportWebVitals();
