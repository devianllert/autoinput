import { useQuery } from '@tanstack/react-query';

import { ipcActions } from '@/renderer/shared/api/ipc-client';

import { CLICKER_HOTKEY_NAME } from '@/shared/clicker/key-conflict';

/** The stored hotkey that starts and stops the clicker. */
export const useClickerHotkey = () =>
  useQuery({
    queryKey: ['hotkeys', 'clicker-toggle'],
    queryFn: () => ipcActions.getHotkeys(),
    select: (data) => data.find((hotkey) => hotkey.name === CLICKER_HOTKEY_NAME),
  });

/** The keys and mode the clicker sends. */
export const useClickerConfig = () =>
  useQuery({
    queryKey: ['clicker-config'],
    queryFn: () => ipcActions.getClickerConfig(),
  });
