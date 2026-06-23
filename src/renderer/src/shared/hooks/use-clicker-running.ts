import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { ipcActions, ipcListeners } from '@/renderer/shared/api/ipc-client';

const CLICKER_RUNNING_QUERY_KEY = ['clicker-running'] as const;

export const useClickerRunning = (): boolean => {
  const queryClient = useQueryClient();

  const { data: isRunning = false } = useQuery({
    queryKey: CLICKER_RUNNING_QUERY_KEY,
    queryFn: () => ipcActions.isClickerRunning(),
  });

  useEffect(() => {
    return ipcListeners.clickerStateChanged.listen((running) => {
      queryClient.setQueryData(CLICKER_RUNNING_QUERY_KEY, running);
    });
  }, [queryClient]);

  return isRunning;
};
