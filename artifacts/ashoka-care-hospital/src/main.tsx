import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import './index.css';

const CLERK_KEY = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? '') as string;

async function mount() {
  const root = createRoot(document.getElementById('root')!, {
    onCaughtError: (error, errorInfo) => {
      console.error(error, errorInfo.componentStack);
    },
  });

  if (CLERK_KEY.startsWith('pk_')) {
    const { ClerkProvider } = await import('@clerk/clerk-react');
    root.render(
      <ErrorBoundary>
        <ClerkProvider publishableKey={CLERK_KEY}>
          <App />
        </ClerkProvider>
      </ErrorBoundary>
    );
  } else {
    // No valid Clerk key — app still loads without patient auth
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  }
}

mount();
