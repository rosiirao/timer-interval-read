import timer, {Timer_Unit} from './timer';

type Provider<T> = {
  data: T[] | (() => T[]);
  append: (d: T) => void;
  next: () => {value: T | void; done?: boolean};
};

type Consumer<T> = {
  consumer: (d: T) => void;
};

const gen = function* <T>(data: T[]) {
  yield* data;
};

const myProviderConstructor: <T>(initData: T[]) => Provider<T> = function <T>(
  initData: T[]
) {
  const data = ([] as T[]).concat(initData);
  let iter = gen(data);
  return {
    data: () => data,
    append: (d: T) => {
      data.push(d);
    },
    next: () => {
      const {value, done} = iter.next();
      if (done && value !== undefined) {
        if (data.length > 0) {
          iter = gen(data);
          return iter.next();
        }
      }
      return {value, done};
    },
  };
};

/**
 * 按指定时间间隔输出值
 * @param iter
 * @param consumer
 * @param intervalSecond
 * @param readCount
 */
async function printValue<T>(
  provider: Provider<T>,
  {consumer}: Consumer<T>,
  intervalSecond: number,
  readCount: number
) {
  for (let i = 0; i < Math.max(1, readCount); i++) {
    await timer(intervalSecond, Timer_Unit.Second);
    const {value, done} = provider.next();
    if (!done && value !== undefined) {
      consumer(value as T);
    }
  }
}

async function testPointProvider() {
  const pointers: Provider<number> = myProviderConstructor(
    new Array(10).fill(1)
  );
  async function appendProvider() {
    // 每 10s 向 provider 追加 10 个数据， 追加 5 次结束
    for (let i = 0; i < 5; i++) {
      const timer = new Promise(resolve => {
        setTimeout(resolve, 10000);
      });
      await timer;
      for (let j = 0; j < 10; j++) {
        pointers.append(j);
      }
    }
  }
  // 异步执行追加数据
  appendProvider();

  // 异步消耗数据
  printValue<number>(
    pointers,
    {
      consumer: d => {
        console.log(d);
      },
    },
    0.5,
    10
  );
}

testPointProvider();
