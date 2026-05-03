import React from 'react';
import AppRouter from './router/AppRouter';
import { ErrorBoundary } from './components/ErrorBoundary';

/**
 * App — root component.
 * All logic has been moved to pages/ and contexts/.
 * This component only mounts the router.
 */
const App: React.FC = () => (
  <ErrorBoundary>
    <AppRouter />
  </ErrorBoundary>
);

export default App;