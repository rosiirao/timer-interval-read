import {Timer_Unit} from '../timer';
import {createTimer} from '../index';
const callbackCreate = (fn?: (_: number) => void) => jest.fn(fn);

function testTimerOrder(
  timers: [interval: number, unit: Timer_Unit][]
): Promise<number>[] {
  return timers.map(async ([interval, unit], index) => {
    await createTimer(interval, unit)();
    return index;
  });
}

async function callTest(
  callback: ReturnType<typeof callbackCreate>,
  ...timers: [interval: number, unit: Timer_Unit][]
) {
  const list = testTimerOrder(timers).map(p =>
    p.then(index => callback(index + 1))
  );
  await Promise.all(list);
}

describe('createTimer', () => {
  test('timer for second passed', async () => {
    const callback = callbackCreate();
    const timers: [interval: number, unit: Timer_Unit][] = [
      2,
      1,
    ].map(interval => [interval, Timer_Unit.Frame]);
    await callTest(callback, ...timers);
    expect(callback.mock.calls).toEqual([[2], [1]]);
  });
  test('timer for frame passed', async () => {
    const callback = callbackCreate();
    const timers: [interval: number, unit: Timer_Unit][] = [
      3,
      2,
      1,
    ].map(interval => [interval, Timer_Unit.Frame]);
    await callTest(callback, ...timers);
    expect(callback.mock.calls).toEqual([[3], [2], [1]]);
  });
  test('timer for millisecond passed', async () => {
    const callback = callbackCreate();
    const timers: [interval: number, unit: Timer_Unit][] = [
      1000,
      500,
    ].map(interval => [interval, Timer_Unit.MilliSecond]);
    await callTest(callback, ...timers);
    expect(callback.mock.calls).toEqual([[2], [1]]);
  });
  test('timer for mixed time unit passed', async () => {
    const callback = callbackCreate();
    const timers: [interval: number, unit: Timer_Unit][] = [
      [2000, Timer_Unit.MilliSecond],
      [1, Timer_Unit.Second],
      [1, Timer_Unit.Frame],
    ];
    await callTest(callback, ...timers);
    expect(callback.mock.calls).toEqual([[3], [2], [1]]);
  });
});
