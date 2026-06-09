import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Activity } from 'lucide-react';
import { getFriendlyErrorMessage } from './utils/errors';
import { Button } from './components/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Error boundary caught an error
  }

  public render() {
    if (this.state.hasError) {
      const errorMessage = getFriendlyErrorMessage(this.state.error);

      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
            <Activity className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-4">Грешка при вчитување</h2>
          <p className="text-zinc-500 mb-8 max-w-xs">{errorMessage}</p>
          <Button onClick={() => window.location.reload()} className="bg-emerald-500 text-black max-w-xs">
            Освежи ја апликацијата
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
