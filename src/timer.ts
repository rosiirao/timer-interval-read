export enum Timer_Unit {
  Second,
  MilliSecond,
  Frame,
}

type TimerCreator = (interval: number) => Promise<void>;

const timerByFrame: TimerCreator = async function (interval) {
  if (interval < 1) {
    throw new Error('帧计时器的间隔帧数需要大于 0 ');
  }
  if (global.requestAnimationFrame === undefined) {
    throw new Error('运行时不支持帧计时器');
  }
  const oneFrame = function () {
    return new Promise(resolve => {
      global.requestAnimationFrame(() => {
        resolve();
      });
    });
  };
  for (let i = 0; i < Math.floor(interval - 1); i++) {
    await oneFrame();
  }
  return new Promise(resolve => {
    global.requestAnimationFrame(() => {
      resolve();
    });
  });
};

const timerByMillisecond: TimerCreator = async function (interval) {
  if (interval < 500) {
    throw new Error('计时器的间隔时间需要大于 0.5s');
  }
  interval = Math.floor(interval / 500) * 500;
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, interval);
  });
};

const createTimer = function (
  interval: number,
  unit: Timer_Unit
): () => Promise<void> {
  const creator: Record<Timer_Unit, () => Promise<void>> = {
    [Timer_Unit.Frame]: () => timerByFrame(interval),
    [Timer_Unit.MilliSecond]: () => timerByMillisecond(interval),
    [Timer_Unit.Second]: () => timerByMillisecond(interval * 1000),
  };
  return creator[unit];
};

export default createTimer;
