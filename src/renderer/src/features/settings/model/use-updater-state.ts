import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { UpdaterState } from '@/main/lib/auto-update';
import { ipcActions, ipcListeners } from '@/renderer/shared/api/ipc-client';

const UPDATER_QUERY_KEY = ['updater-state'] as const;

export const useUpdaterState = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: UPDATER_QUERY_KEY,
    queryFn: () => ipcActions.getUpdateState(),
  });

  useEffect(() => {
    const unsubscribe = ipcListeners.updateStateChanged.listen((state: UpdaterState) => {
      queryClient.setQueryData(UPDATER_QUERY_KEY, state);
    });

    return () => unsubscribe();
  }, [queryClient]);

  const checkForUpdates = async (): Promise<void> => {
    const state = await ipcActions.checkForUpdates();
    queryClient.setQueryData(UPDATER_QUERY_KEY, state);
  };

  const restartToUpdate = async (): Promise<boolean> => {
    const result = await ipcActions.restartToUpdate();
    return result.success;
  };

  return {
    updaterState: query.data,
    queryError: query.error,
    checkForUpdates,
    restartToUpdate,
  };
};
