import createTimer, {Timer_Unit} from './timer';

type ReadOptions = {
  interval: number;
  rotate?: boolean;
  time_unit?: Timer_Unit;
  stopExecutor?: (stop: () => void) => void;
  max_times?: number;
};

const defaultOptions: ReadOptions = {
  rotate: false,
  interval: 1,
  time_unit: Timer_Unit.Second,
};

export async function read<T>(
  iterable: Iterable<T>,
  consume: (t: T) => void,
  options = defaultOptions
): Promise<void> {
  const {
    rotate,
    interval,
    time_unit,
    stopExecutor,
    max_times = Infinity,
  } = options;
  const timer = createTimer(
    interval,
    time_unit ?? (defaultOptions.time_unit as number)
  );
  // a quit flag can be set by stop function of options.stopExecutor
  let quit = false;
  if (stopExecutor !== undefined) {
    const stop = () => {
      quit = true;
    };
    stopExecutor(stop);
  }
  if (rotate) {
    // if need rotate read, convert it to a arry.
    iterable = Array.from(iterable);
  }
  let times = 0;
  for (;;) {
    for (const item of iterable) {
      await timer();
      if (quit) {
        return;
      }
      times++;
      consume(item);
      if (max_times <= times) {
        return;
      }
    }
    if (!rotate) {
      return;
    }
  }
}

export default read;
