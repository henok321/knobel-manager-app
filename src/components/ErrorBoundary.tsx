import { Alert, Button, Container, Stack, Text, Title } from '@mantine/core';
import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    // eslint-disable-next-line no-process-env
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // In production, you could send this to an error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Container py="xl" size="md">
          <Stack gap="lg">
            <Title order={1}>Something went wrong</Title>

            <Alert color="red" title="Error Details" variant="filled">
              <Text size="sm">
                {this.state.error?.message || 'An unexpected error occurred'}
              </Text>
            </Alert>

            {/* eslint-disable-next-line no-process-env */}
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <Alert color="yellow" title="Component Stack" variant="light">
                <Text
                  component="pre"
                  size="xs"
                  style={{
                    overflow: 'auto',
                    maxHeight: '300px',
                    fontFamily: 'monospace',
                  }}
                >
                  {this.state.errorInfo.componentStack}
                </Text>
              </Alert>
            )}

            <Button onClick={this.handleReset}>Try Again</Button>

            <Button
              component="a"
              href="/"
              variant="subtle"
              onClick={() => {
                window.location.href = '/';
              }}
            >
              Go to Home Page
            </Button>
          </Stack>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
