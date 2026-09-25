import "server-only";

export const IGDB_MAX_REQUESTS_PER_SECOND = 4;
export const IGDB_MAX_CONCURRENT_REQUESTS = 8;

type QueuedRequest = {
  reject: (reason?: unknown) => void;
  resolve: (value: unknown) => void;
  task: () => Promise<unknown>;
};

export type IgdbRequestLimiter = {
  schedule<T>(task: () => Promise<T>): Promise<T>;
};

type IgdbRequestLimiterOptions = {
  maxConcurrent?: number;
  maxPerSecond?: number;
  now?: () => number;
  setTimeout?: typeof globalThis.setTimeout;
};

/**
 * Keeps IGDB calls inside the process-wide limits required by the contract.
 * A shared instance is used by route handlers, while tests can inject one.
 */
export function createIgdbRequestLimiter(
  options: IgdbRequestLimiterOptions = {},
): IgdbRequestLimiter {
  const maxConcurrent = options.maxConcurrent ?? IGDB_MAX_CONCURRENT_REQUESTS;
  const maxPerSecond = options.maxPerSecond ?? IGDB_MAX_REQUESTS_PER_SECOND;
  const now = options.now ?? Date.now;
  const scheduleTimeout = options.setTimeout ?? globalThis.setTimeout;
  const queue: QueuedRequest[] = [];
  const starts: number[] = [];
  let active = 0;
  let wakeTimer: ReturnType<typeof globalThis.setTimeout> | undefined;

  const pump = () => {
    const currentTime = now();

    while (starts.length > 0 && currentTime - starts[0] >= 1000) {
      starts.shift();
    }

    if (queue.length === 0 || active >= maxConcurrent) {
      return;
    }

    if (starts.length >= maxPerSecond) {
      const delay = Math.max(1, starts[0] + 1000 - currentTime);

      if (wakeTimer === undefined) {
        wakeTimer = scheduleTimeout(() => {
          wakeTimer = undefined;
          pump();
        }, delay);
      }

      return;
    }

    const request = queue.shift();

    if (!request) {
      return;
    }

    starts.push(currentTime);
    active += 1;

    void Promise.resolve()
      .then(request.task)
      .then(request.resolve, request.reject)
      .finally(() => {
        active -= 1;
        pump();
      });

    pump();
  };

  return {
    schedule<T>(task: () => Promise<T>) {
      return new Promise<T>((resolve, reject) => {
        queue.push({
          reject,
          resolve: (value) => resolve(value as T),
          task: async () => task(),
        });
        pump();
      });
    },
  };
}

export const sharedIgdbRequestLimiter = createIgdbRequestLimiter();
