const MIN_REQUEST_INTERVAL = 1_000;

let nextRequestAt = 0;
let requestQueue: Promise<void> = Promise.resolve();

export const runWithGreenApiRateLimit = async <T>(
  request: () => Promise<T>,
): Promise<T> => {
  const queuedRequest = requestQueue.then(async () => {
    const waitTime = Math.max(0, nextRequestAt - Date.now());

    if (waitTime > 0) {
      await new Promise<void>((resolve) => {
        globalThis.setTimeout(resolve, waitTime);
      });
    }

    nextRequestAt = Date.now() + MIN_REQUEST_INTERVAL;
    return request();
  });

  requestQueue = queuedRequest.then(
    () => undefined,
    () => undefined,
  );

  return queuedRequest;
};
