import React from 'react';

interface Props {
  children: React.ReactNode;
  sectionName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class SectionErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-center">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
            Something went wrong{this.props.sectionName ? ` in ${this.props.sectionName}` : ''}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
