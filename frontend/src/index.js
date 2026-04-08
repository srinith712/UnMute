import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

/* Simple Error Boundary */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('App Error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <p>Something went wrong. Please refresh.</p>
                </div>
            );
        }
        return this.props.children;
    }
}

/* Root mounting */
const container = document.getElementById('root');

if (!container) {
    throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(container);

root.render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>
);