import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import './index.css';

const CLERK_KEY = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? '') as string;

const isValidClerkKey = CLERK_KEY.startsWith('pk_test_') || CLERK_KEY.startsWith('pk_live_');

// Clerk proxy URL required for vercel.app domains (production instance)
const CLERK_PROXY_URL = import.meta.env.VITE_CLERK_PROXY_URL as string | undefined;

const root = createRoot(document.getElementById('root')!, {
  onCaughtError: (error: unknown, errorInfo) => {
    console.error('[App Error]', error instanceof Error ? error.message : String(error), errorInfo.componentStack);
  },
});

async function mount() {
  if (isValidClerkKey) {
    try {
      const { ClerkProvider } = await import('@clerk/clerk-react');

      root.render(
        <ErrorBoundary>
          {CLERK_PROXY_URL
            ? <ClerkProvider publishableKey={CLERK_KEY} proxyUrl={CLERK_PROXY_URL}><App /></ClerkProvider>
            : <ClerkProvider publishableKey={CLERK_KEY}><App /></ClerkProvider>
          }
        </ErrorBoundary>
      );
      return;
    } catch (e) {
      console.warn('[Clerk] Failed to load:', e);
    }
  }
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

mount();
