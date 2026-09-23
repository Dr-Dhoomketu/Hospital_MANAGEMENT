import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import './index.css';

const CLERK_KEY = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? '') as string;

// Only mount ClerkProvider if we have a key that looks valid
// A valid Clerk publishable key starts with pk_test_ or pk_live_
const isValidClerkKey = CLERK_KEY.startsWith('pk_test_') || CLERK_KEY.startsWith('pk_live_');

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
          <ClerkProvider publishableKey={CLERK_KEY}>
            <App />
          </ClerkProvider>
        </ErrorBoundary>
      );
      return;
    } catch (e) {
      console.warn('[Clerk] Failed to load, running without auth:', e);
    }
  }
  // Fallback: run without Clerk — patient login shows a notice
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

mount();
