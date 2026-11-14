import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F9F8F5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex items-center justify-center p-6 select-none">
          <div className="max-w-md w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-3xl">
              ⚡
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Momentum Needs a Refresh</h1>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                An unexpected error occurred during display. Your data is stored safely.
              </p>
            </div>
            {this.state.error && (
              <div className="p-3 bg-stone-100 dark:bg-stone-800/60 rounded-xl text-left text-xs font-mono text-stone-600 dark:text-stone-300 max-h-32 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}
            <div className="space-y-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white text-white font-medium rounded-2xl transition-all shadow-sm active:scale-98"
              >
                Reload App
              </button>
              <button
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium rounded-2xl transition-all active:scale-98"
              >
                Reset Local Cache & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
