export const httpStatus = (error: unknown): number | undefined =>
  typeof error === 'object' &&
  error !== null &&
  'status' in error &&
  typeof error.status === 'number'
    ? error.status
    : undefined;

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
