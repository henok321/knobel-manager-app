import type { AxiosError, AxiosResponse } from 'axios';

export const extractResponseData = <T>(
  response:
    | (AxiosResponse<T | Record<string, never>> & { error?: undefined })
    | (AxiosError & { data?: undefined; error: unknown }),
): T => {
  if ('error' in response && response.error !== undefined) {
    throw new Error(
      `API request failed: ${response.error instanceof Error ? response.error.message : String(response.error)}`,
    );
  }

  const successResponse = response as AxiosResponse<T | Record<string, never>>;

  if (!successResponse.data || Object.keys(successResponse.data).length === 0) {
    throw new Error(
      'Response data is empty. This should not happen with throwOnError: true.',
    );
  }

  return successResponse.data as T;
};
