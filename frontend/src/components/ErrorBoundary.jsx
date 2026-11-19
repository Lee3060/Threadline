import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';
import EmptyState from './EmptyState';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unexpected UI error', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="container page-pad">
        <EmptyState
          icon={AlertTriangle}
          title="Something went wrong"
          action={
            <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
              Reload page
            </button>
          }
        >
          An unexpected error stopped this page from loading. Reloading usually fixes it.
        </EmptyState>
      </div>
    );
  }
}
