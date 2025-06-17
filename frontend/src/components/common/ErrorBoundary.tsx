import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    // You can also log the error to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-destructive">Something went wrong</h2>
                <p className="text-muted-foreground">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="overflow-hidden rounded-md border">
                  <summary className="cursor-pointer bg-muted/50 p-2 font-mono text-sm">
                    Error Details
                  </summary>
                  <pre className="max-h-60 overflow-auto p-2 text-xs">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={this.handleReset}>
                  Try again
                </Button>
                <Button
                  variant="default"
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher Order Component for Error Boundaries
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  FallbackComponent?: React.ComponentType<{ error: Error | null }>
) => {
  return (props: P) => (
    <ErrorBoundary
      fallback={
        FallbackComponent ? (
          <FallbackComponent error={null} />
        ) : undefined
      }
    >
      <Component {...props} />
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
