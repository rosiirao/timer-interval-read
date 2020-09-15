export default function createStream<T>({
  generator,
  rotate = false,
}: {
  generator: () => Generator<T, void, unknown>;
  rotate: boolean;
}): ReadableStream<T> {
  function pullData(controller: ReadableStreamDefaultController<T>) {
    const iter = generator();
    const d = iter.next();
    if (!d.done) {
      controller.enqueue(d.value);
    }
    for (let d = iter.next(); !d.done; d = iter.next()) {
      controller.enqueue(d.value);
    }
  }
  return new global.ReadableStream({
    start(controller) {
      pullData(controller);
      if (!rotate) {
        controller.close();
      }
    },
    pull(controller) {
      if (rotate) {
        pullData(controller);
      }
    },
    // cancel() {},
  });
}
