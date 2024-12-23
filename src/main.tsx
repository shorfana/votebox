import { ActorProvider, AgentProvider } from '@ic-reactor/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import { canisterId, idlFactory } from './declarations/backend';
import { ThemeProvider } from '@material-tailwind/react';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AgentProvider withProcessEnv>
      <ActorProvider idlFactory={idlFactory} canisterId={canisterId}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ActorProvider>
    </AgentProvider>
  </React.StrictMode>,
);
