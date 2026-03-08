import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('[ErrorBoundary] Erro capturado:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          fontFamily: 'monospace',
          padding: '2rem',
          background: '#0f172a',
          color: '#f1f5f9'
        }}>
          <div style={{
            maxWidth: '800px',
            width: '100%',
            background: '#1e293b',
            borderRadius: '12px',
            padding: '2rem',
            border: '1px solid #ef4444'
          }}>
            <h1 style={{ color: '#ef4444', marginTop: 0 }}>⚠️ Erro de Runtime</h1>
            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
              O app encontrou um erro. Copie a mensagem abaixo e envie para o suporte:
            </p>
            <pre style={{
              background: '#0f172a',
              padding: '1rem',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '0.8rem',
              color: '#fbbf24',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}>
              {this.state.error?.toString()}
              {'\n\n'}
              {this.state.error?.stack}
              {'\n\nComponent Stack:'}
              {this.state.info?.componentStack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
