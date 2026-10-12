import { Worker, WorkerOptions } from 'node:worker_threads';

interface EnhanceWorkerOptions<TMessage = unknown, TData = unknown> {
  data?: TData;

  onMessage?: (message: TMessage) => void;
  onError?: (error: Error) => void;
  onFinish?: (exitCode: number) => void;
  onSuccess?: () => void;
  onCancel?: () => void;
  onOnline?: () => void;
}

/**
 * More convenient wrapper around the Worker class.
 * Handles event listeners, error handling, and termination.
 */
export const enhancedWorker = <TMessage = unknown, TData = unknown>(
  workerFactory: (options: WorkerOptions) => Worker,
  options: EnhanceWorkerOptions<TMessage, TData>,
) => {
  const { data } = options;

  let worker: Worker | null = workerFactory({
    workerData: data,
  });

  let terminated = false;

  const onMessage = (message: TMessage) => options.onMessage?.(message);
  const onError = (error: Error) => options.onError?.(error);
  const onFinish = (exitCode: number) => {
    worker?.off('message', onMessage);
    worker?.off('error', onError);
    worker?.off('exit', onFinish);

    if (terminated) {
      // `terminate()` always exits with a non-zero code; that is a requested stop, not a failure.
      options.onCancel?.();
    } else if (exitCode === 0) {
      options.onSuccess?.();
    } else {
      options.onError?.(new Error(`Worker exited with code ${exitCode}`));
    }

    options.onFinish?.(exitCode);
  };
  const onOnline = () => options.onOnline?.();

  worker.on('message', onMessage);
  worker.on('error', onError);
  worker.on('exit', onFinish);
  worker.on('online', onOnline);

  /** Resolves when the worker thread has exited, for any reason. */
  const exited = new Promise<void>((resolve) => {
    worker?.once('exit', () => resolve());
  });

  return {
    exited,
    threadId: worker?.threadId,
    _worker: worker,
    postMessage: (message: unknown) => worker?.postMessage(message),
    terminate: () => {
      terminated = true;
      void worker?.terminate().finally(() => {
        worker = null;
      });
    },
  };
};
