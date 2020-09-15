
import {Timer_Unit} from '../timer';
import createStream from '../generator-stream';
import readByTimer from '../read-by-timer';

beforeEach(() => {
  // jest.useFakeTimers();
});

const callbackCreate = (fn?: (_: number) => void) => jest.fn(fn);

describe('read by timer', () => {
  const generator = function* () {
    for (const i of [3, 2, 1]) {
      yield i;
    }
  };
  type ReadOptions = Parameters<typeof readByTimer>[2];
  test('read by timer passed', async () => {
    const callback = callbackCreate();
    const readOptions: ReadOptions = {
      interval: 1,
      time_unit: Timer_Unit.Frame,
    };
    await readByTimer(generator(), callback, readOptions);
    expect(callback.mock.calls).toHaveLength(Array.from(generator()).length);
  }, 1000);
  test('Rotatively read by timer passed', async () => {
    const callback = callbackCreate();
    const maxTimes = 7;
    const readOptions: ReadOptions = {
      rotate: true,
      interval: 1,
      max_times: maxTimes,
      time_unit: Timer_Unit.Frame,
    };
    await readByTimer(generator(), callback, readOptions);
    expect(callback.mock.calls).toHaveLength(maxTimes);
    let readNumbers: number[] = [];
    for (;;) {
      readNumbers = readNumbers.concat(Array.from(generator()));
      if (readNumbers.length > maxTimes) {
        readNumbers.splice(maxTimes);
        break;
      }
    }
    readNumbers.forEach((x, i) => expect(callback.mock.calls[i]).toEqual([x]));
  }, 1000);
  test('stop rotatory reader by timer', async () => {
    jest.useRealTimers();
    const callback = callbackCreate();
    let stop: () => void = () => {
      /** do nothing */ 1;
    };
    const readOptions: ReadOptions = {
      rotate: true,
      interval: 1,
      time_unit: Timer_Unit.Frame,
      stopExecutor: s => {
        stop = s;
      },
    };
    const reading = readByTimer(generator(), callback, readOptions);
    setTimeout(stop as () => void, 250);
    await reading;
    expect(callback.mock.calls.length).toBeGreaterThanOrEqual(14);
    expect(callback.mock.calls.length).toBeLessThanOrEqual(16);
  }, 2000);
});

/**
 * readable stream is an experiment function in ES, and not testable in nodeJS
 */
test.skip('generator stream passed', async () => {
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
  expect(callback.mock.calls).toEqual([[3], [2], [1], [3]]);
});
