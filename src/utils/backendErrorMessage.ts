export const backendErrorMessage = (error: unknown): string | undefined => {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const { data } = error;

    if (
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof data.error === 'string'
    ) {
      return data.error;
    }
  }

  return error instanceof Error ? error.message : undefined;
};
