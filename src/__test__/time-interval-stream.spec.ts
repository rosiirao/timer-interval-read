import {createTimer} from '../index';
import {Timer_Unit} from '../timer';
import createStream from '../generator-stream';

async function testTimerArray(
  callback: (_: number) => void,
  ...timers: [interval: number, unit: Timer_Unit][]
) {
  const timerPromiseList: Promise<void>[] = timers.map(
    async ([interval, unit], index) => {
      return expect(createTimer(interval, unit)())
        .resolves.toBe(undefined)
        .then(() => callback(index + 1));
    }
  );
  return Promise.all(timerPromiseList);
}

const callbackCreate = () =>
  jest.fn((_: number) => {
    /* do nothing */ _;
  });

describe('createTimer', () => {
  test('timer for second pass', async () => {
    const callback = callbackCreate();
    const timers: [interval: number, unit: Timer_Unit][] = [
      2,
      1,
    ].map(interval => [interval, Timer_Unit.Frame]);
    await testTimerArray(callback, ...timers);
    expect(callback.mock.calls[0][0]).toBe(2);
    expect(callback.mock.calls[1][0]).toBe(1);
  });
  test('timer for frame pass', async () => {
    const callback = callbackCreate();
    const timers: [interval: number, unit: Timer_Unit][] = [
      3,
      2,
      1,
    ].map(interval => [interval, Timer_Unit.Frame]);
    await testTimerArray(callback, ...timers);
    expect(callback.mock.calls[0][0]).toBe(3);
    expect(callback.mock.calls[1][0]).toBe(2);
    expect(callback.mock.calls[2][0]).toBe(1);
  });
  test('timer for millisecond pass', async () => {
    const callback = callbackCreate();
    const timers: [interval: number, unit: Timer_Unit][] = [
      2000,
      1000,
    ].map(interval => [interval, Timer_Unit.MilliSecond]);
    await testTimerArray(callback, ...timers);
    expect(callback.mock.calls[0][0]).toBe(2);
    expect(callback.mock.calls[1][0]).toBe(1);
  });
  test('timer for mixed time unit pass', async () => {
    const callback = callbackCreate();
    const timers: [interval: number, unit: Timer_Unit][] = [
      [2000, Timer_Unit.MilliSecond],
      [1, Timer_Unit.Second],
      [1, Timer_Unit.Frame],
    ];
    await testTimerArray(callback, ...timers);
    expect(callback.mock.calls[0][0]).toBe(3);
    expect(callback.mock.calls[1][0]).toBe(2);
    expect(callback.mock.calls[2][0]).toBe(1);
  });
});

test('generator stream pass', async () => {
  const generator = function* () {
    for (const i of [3, 2, 1]) {
      yield i;
    }
  };
  const stream = createStream({generator, rotate: true});
  const callback = callbackCreate();

  const reader = stream.getReader();
  await reader.read().then();
  await reader.read().then();
  await reader.read().then();
  await reader.read().then();
  await reader.cancel();
  expect(callback.mock.calls[0][0]).toBe(3);
  expect(callback.mock.calls[1][0]).toBe(2);
  expect(callback.mock.calls[2][0]).toBe(1);
  expect(callback.mock.calls[3][0]).toBe(3);
});
