import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { backendErrorMessage } from './backendErrorMessage.ts';

describe('backendErrorMessage', () => {
  it('returns the message the API sent', () => {
    assert.equal(
      backendErrorMessage({
        status: 409,
        data: { error: 'Game is not editable' },
      }),
      'Game is not editable',
    );
  });

  it('falls back to the Error message when there is no API payload', () => {
    assert.equal(backendErrorMessage(new Error('offline')), 'offline');
  });

  it('returns undefined for payloads that carry no message', () => {
    assert.equal(backendErrorMessage({ status: 500, data: {} }), undefined);
    assert.equal(
      backendErrorMessage({ status: 'FETCH_ERROR', error: 'off' }),
      undefined,
    );
    assert.equal(
      backendErrorMessage({ status: 409, data: { error: 42 } }),
      undefined,
    );
    assert.equal(backendErrorMessage(undefined), undefined);
    assert.equal(backendErrorMessage('boom'), undefined);
  });
});
