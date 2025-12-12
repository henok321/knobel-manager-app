import type { AxiosError, AxiosResponse } from 'axios';

/**
 * Extracts data from a hey-api response.
 * With throwOnError: true, errors should be thrown at runtime, but TypeScript
 * still sees the union type, so we need to handle both cases.
 */
export const extractResponseData = <T>(
  response:
    | (AxiosResponse<T> & { error?: undefined })
    | (AxiosError & { data?: undefined; error: unknown }),
): T => {
  // Type guard: check if this is an error response
  if ('error' in response && response.error !== undefined) {
    throw new Error(
      `API request failed: ${response.error instanceof Error ? response.error.message : String(response.error)}`,
    );
  }

  // After the error check, TypeScript knows this is a success response
  const data = response.data;

  // Check for null/undefined or empty object (but allow arrays and other values)
  if (
    data === null ||
    data === undefined ||
    (typeof data === 'object' &&
      !Array.isArray(data) &&
      Object.keys(data).length === 0)
  ) {
    throw new Error(
      'Response data is empty. This should not happen with throwOnError: true.',
    );
  }

  return data;
};
