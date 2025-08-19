import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Import debug utility in development
if (import.meta.env.DEV) {
  import('./lib/firebase-debug.ts').then(module => {
    // Make debug function available in console
    (window as any).debugFirestore = module.debugFirestore;
    console.log('🛠️ Debug mode: Use debugFirestore() in console to test Firestore connectivity');
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)