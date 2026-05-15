import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Widget from './Widget.jsx'

// Dynamically create the container if it doesn't exist
let container = document.getElementById('ai-sales-agent-root');
if (!container) {
  container = document.createElement('div');
  container.id = 'ai-sales-agent-root';
  document.body.appendChild(container);
}

// If CloserAIConfig is provided globally, run strictly in Widget mode.
// Otherwise, run in Dashboard setup mode.
if (window.CloserAIConfig) {
  createRoot(container).render(
    <StrictMode>
      <Widget config={window.CloserAIConfig} />
    </StrictMode>,
  );
} else {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
