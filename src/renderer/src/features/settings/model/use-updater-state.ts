import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { UpdaterState } from '@/main/lib/auto-update';
import { ipcActions, ipcListeners } from '@/renderer/shared/api/ipc-client';

const UPDATER_QUERY_KEY = ['updater-state'] as const;

export const useUpdaterState = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: UPDATER_QUERY_KEY,
    queryFn: () => ipcActions.getUpdateState(),
  });
  const checkMutation = useMutation({
    mutationFn: () => ipcActions.checkForUpdates(),
    onSuccess: (state) => {
      queryClient.setQueryData(UPDATER_QUERY_KEY, state);
    },
  });
  const restartMutation = useMutation({
    mutationFn: async () => {
      const result = await ipcActions.restartToUpdate();

      if (!result.success) {
        throw new Error('Updater rejected the restart request.');
      }
    },
  });

  useEffect(() => {
    const unsubscribe = ipcListeners.updateStateChanged.listen((state: UpdaterState) => {
      queryClient.setQueryData(UPDATER_QUERY_KEY, state);
    });

    return () => unsubscribe();
  }, [queryClient]);

  const checkForUpdates = (): void => {
    restartMutation.reset();
    checkMutation.mutate();
  };

  const restartToUpdate = (): void => {
    checkMutation.reset();
    restartMutation.mutate();
  };

  return {
    updaterState: query.data,
    queryError: query.error,
    checkError: checkMutation.error,
    restartError: restartMutation.error,
    isCheckPending: checkMutation.isPending,
    isRestartPending: restartMutation.isPending,
    checkForUpdates,
    restartToUpdate,
  };
};
