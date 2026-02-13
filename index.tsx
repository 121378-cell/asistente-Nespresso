import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('SW registration failed:', error);
      }
    });
  });
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppProvider>
            <App />
            <ReactQueryDevtools initialIsOpen={false} />
          </AppProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
