import React from 'react';
import PropTypes from 'prop-types';

/**
 * ErrorBoundary catches unhandled JavaScript errors anywhere in the component
 * tree beneath it and renders a fallback UI instead of crashing the whole app.
 *
 * @augments {React.Component<ErrorBoundaryProps, ErrorBoundaryState>}
 */
class ErrorBoundary extends React.Component {
  /**
   * @param {ErrorBoundaryProps} props
   */
  constructor(props) {
    super(props);
    /** @type {ErrorBoundaryState} */
    this.state = { hasError: false, errorMessage: '' };
  }

  /**
   * Called by React when a descendant throws during render.
   * Maps the thrown error to the component state so `render` shows the fallback.
   *
   * @param {Error} error - The thrown error.
   * @returns {ErrorBoundaryState} New state that triggers the fallback UI.
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.message };
  }

  /**
   * Lifecycle method called after an error has been caught.
   * Used here to log the error details for debugging.
   *
   * @param {Error}           error - The thrown error.
   * @param {React.ErrorInfo} info  - Component stack trace information.
   * @returns {void}
   */
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" style={styles.container}>
          <h2 style={styles.heading}>Something went wrong</h2>
          <p style={styles.message}>
            {this.state.errorMessage || 'An unexpected error occurred. Please refresh the page.'}
          </p>
          <button
            style={styles.button}
            onClick={() => this.setState({ hasError: false, errorMessage: '' })}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/** Inline styles kept minimal so ErrorBoundary works even if CSS modules fail. */
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    padding: '2rem',
    textAlign: 'center',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    margin: '1rem',
    background: '#fff8f8'
  },
  heading: {
    color: '#c0392b',
    marginBottom: '0.5rem'
  },
  message: {
    color: '#555',
    marginBottom: '1rem',
    maxWidth: '400px'
  },
  button: {
    padding: '0.5rem 1.5rem',
    background: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem'
  }
};

ErrorBoundary.propTypes = {
  /** The component subtree to guard against runtime errors. */
  children: PropTypes.node.isRequired
};

/**
 * @typedef {Object} ErrorBoundaryProps
 * @property {React.ReactNode} children - Child components to render and guard.
 */

/**
 * @typedef {Object} ErrorBoundaryState
 * @property {boolean} hasError      - Whether an error has been caught.
 * @property {string}  errorMessage  - Human-readable error message.
 */

export default ErrorBoundary;
