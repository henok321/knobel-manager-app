import { AxiosResponse } from 'axios';

import { extractResponseData } from './responseUtils';

describe('extractResponseData', () => {
  it('should extract valid response data', () => {
    const response: AxiosResponse<{ value: string }> = {
      data: { value: 'test' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as unknown as AxiosResponse['config'],
    };

    expect(extractResponseData(response)).toEqual({ value: 'test' });
  });

  it('should throw on empty object fallback', () => {
    const response: AxiosResponse<Record<string, never>> = {
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as unknown as AxiosResponse['config'],
    };

    expect(() => extractResponseData(response)).toThrow(
      'Response data is empty. This should not happen with throwOnError: true.',
    );
  });

  it('should throw on null data', () => {
    const response: AxiosResponse<null> = {
      data: null,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as unknown as AxiosResponse['config'],
    };

    expect(() => extractResponseData(response)).toThrow();
  });

  it('should handle nested response types', () => {
    type GameResponse = { game: { id: number; name: string } };
    const response: AxiosResponse<GameResponse> = {
      data: { game: { id: 1, name: 'Test Game' } },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as unknown as AxiosResponse['config'],
    };

    const result = extractResponseData(response);
    expect(result.game.id).toBe(1);
    expect(result.game.name).toBe('Test Game');
  });
});
