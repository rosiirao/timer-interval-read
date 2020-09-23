import createTimer, {Timer_Unit} from './timer';

export type ReadOptions = {
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

export async function readByTimer<T>(
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
  // the rotate cached array with a max length
  let cache: {
    readonly maxLength: number;
    readonly data: T[];
    closed: boolean;
    push: (data: T) => T[];
    close: () => void;
  };
  if (rotate) {
    // if need rotate read, convert it to a arry.
    cache = {
      closed: false,
      data: [],
      maxLength: 1024,
      push: function (data) {
        if (!this.closed && cache.data.length < cache.maxLength) {
          cache.data.push(data);
        }
        return cache.data;
      },
      close: function () {
        this.closed = true;
      },
    };
  }

  let times = 0;
  for (let t = timer(); ; ) {
    for (const item of iterable) {
      await t;
      if (quit) {
        return;
      }
      // create and run next timer ahead of consuming
      t = timer();
      times++;
      consume(item);
      if (max_times <= times) {
        return;
      }
      if (rotate) {
        cache!.push(item);
      }
    }
    if (!rotate || ((iterable as T[]) = cache!.data).length === 0) {
      return;
    }
    cache!.close();
  }
}

export default readByTimer;
