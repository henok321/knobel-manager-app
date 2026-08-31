import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isConflictError } from './isConflictError.ts';

describe('isConflictError', () => {
  it('recognises a 409 from the API', () => {
    assert.equal(
      isConflictError({
        status: 409,
        data: { error: 'Game setup already assigned, reset the setup first' },
      }),
      true,
    );
  });

  it('ignores other status codes', () => {
    assert.equal(isConflictError({ status: 400, data: {} }), false);
    assert.equal(isConflictError({ status: 404, data: {} }), false);
  });

  it('ignores fetch and serialisation failures', () => {
    assert.equal(
      isConflictError({ status: 'FETCH_ERROR', error: 'off' }),
      false,
    );
    assert.equal(isConflictError(new Error('boom')), false);
  });

  it('ignores values that carry no status at all', () => {
    assert.equal(isConflictError(undefined), false);
    assert.equal(isConflictError(null), false);
    assert.equal(isConflictError('409'), false);
  });
});
