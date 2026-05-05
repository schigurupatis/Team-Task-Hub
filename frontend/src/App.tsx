import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ToastProvider } from '@/components/common/Toast';
import { Dashboard } from '@/pages/Dashboard';

const App: React.FC = () => (
  <Provider store={store}>
    <ToastProvider>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-xl focus:font-semibold">
        Skip to main content
      </a>
      <Dashboard />
    </ToastProvider>
  </Provider>
);

export default App;
