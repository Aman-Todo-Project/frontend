import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { store } from './store';
import { fetchWeeks } from './store/tasksSlice';
import './index.css';

// Start loading tasks immediately, in parallel with the first page chunk.
store.dispatch(fetchWeeks());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
