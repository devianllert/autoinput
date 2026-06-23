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

  const onMessage = (message: TMessage) => options.onMessage?.(message);
  const onError = (error: Error) => options.onError?.(error);
  const onFinish = (exitCode: number) => {
    worker?.off('message', onMessage);
    worker?.off('error', onError);
    worker?.off('exit', onFinish);

    if (exitCode === 0) {
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

  return {
    threadId: worker?.threadId,
    _worker: worker,
    postMessage: (message: unknown) => worker?.postMessage(message),
    terminate: () => {
      void worker?.terminate().finally(() => {
        worker = null;
      });
    },
  };
};
