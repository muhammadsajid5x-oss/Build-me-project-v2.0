export type LazyLoadMeasurement = {
  name: string;
  duration: number;
};

export function measureLazyLoad<T>(
  name: string,
  loader: () => Promise<T>,
): () => Promise<T> {
  return async () => {
    const start = performance.now();

    try {
      return await loader();
    } finally {
      const duration = performance.now() - start;

      console.info(`[LazyLoad] ${name}: ${duration.toFixed(2)}ms`);
    }
  };
}
