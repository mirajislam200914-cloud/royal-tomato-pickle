import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black p-6">
          <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-10 text-center space-y-6">
            <div className="w-16 h-16 bg-royal-red/20 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-royal-red" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-light text-white tracking-tight">System Disturbance</h1>
              <p className="text-white/40 text-sm italic">
                The Royal vault encountered an unexpected anomaly. Our master picklers have been notified.
              </p>
            </div>
            {this.state.error && (
              <pre className="p-4 bg-black/50 rounded-xl text-left font-mono text-[10px] text-royal-red/60 overflow-hidden line-clamp-3">
                {this.state.error.message}
              </pre>
            )}
            <Button 
              onClick={() => window.location.reload()}
              className="w-full rounded-full bg-royal-red hover:bg-royal-red/80 py-6"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Reset Experience
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
