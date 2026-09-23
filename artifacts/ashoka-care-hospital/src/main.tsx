import { createRoot } from 'react-dom/client';
import { AuthProvider } from '@/lib/auth';
import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import './index.css';

createRoot(document.getElementById('root')!, {
  onCaughtError: (error: unknown, errorInfo) => {
    console.error('[App Error]', error instanceof Error ? error.message : String(error), errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ErrorBoundary>
);
