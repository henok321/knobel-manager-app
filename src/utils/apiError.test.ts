import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { backendErrorMessage, httpStatus } from './apiError.ts';

describe('httpStatus', () => {
  it('returns the HTTP status the API answered with', () => {
    assert.equal(httpStatus({ status: 409, data: { error: 'conflict' } }), 409);
    assert.equal(httpStatus({ status: 404, data: {} }), 404);
  });

  it('returns undefined for anything that is not an HTTP status', () => {
    assert.equal(
      httpStatus({ status: 'FETCH_ERROR', error: 'off' }),
      undefined,
    );
    assert.equal(httpStatus(new Error('boom')), undefined);
    assert.equal(httpStatus(undefined), undefined);
    assert.equal(httpStatus('409'), undefined);
  });
});

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
