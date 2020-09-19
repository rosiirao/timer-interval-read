/**
 * test iterable
 */

describe('iterable read', () => {
  test('iterable can only read once passed', () => {
    const generator = function* () {
      for (const i of [3, 2, 1]) {
        yield i;
      }
    };
    const callback = jest.fn();
    const iterable = generator();
    for (let t = 0; t < 2; t++) {
      for (const i of iterable) {
        callback(i);
      }
    }
    expect(callback.mock.calls).toHaveLength(3);
  });
});
