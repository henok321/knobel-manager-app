import { Alert, Button, Container, Stack, Text, Title } from '@mantine/core';
import { Component, ErrorInfo, ReactNode } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

interface ErrorBoundaryProps extends WithTranslation {
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

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development

    if (import.meta.env.MODE === 'development') {
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

  override render(): ReactNode {
    const { t } = this.props;

    if (this.state.hasError) {
      return (
        <Container py="xl" size="md">
          <Stack gap="lg">
            <Title order={1}>{t('errorBoundary.title')}</Title>

            <Alert
              color="red"
              title={t('errorBoundary.errorDetails')}
              variant="filled"
            >
              <Text size="sm">
                {this.state.error?.message ||
                  t('errorBoundary.unexpectedError')}
              </Text>
            </Alert>

            {import.meta.env.MODE === 'development' && this.state.errorInfo && (
              <Alert
                color="yellow"
                title={t('errorBoundary.componentStack')}
                variant="light"
              >
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

            <Button onClick={this.handleReset}>
              {t('errorBoundary.tryAgain')}
            </Button>

            <Button
              component="a"
              href="/"
              variant="subtle"
              onClick={() => {
                window.location.href = '/';
              }}
            >
              {t('errorBoundary.goToHomePage')}
            </Button>
          </Stack>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);
