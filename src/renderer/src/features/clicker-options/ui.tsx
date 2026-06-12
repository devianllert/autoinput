import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { StoredHotkey } from '@/main/hotkeys/list';
import { Toggle } from '@/renderer/shared/ui/toggle';

import { formatHotkeyKeys } from '@/shared/hotkeys/keys';

import { ipcActions } from '../../shared/api/ipc-client';
import { Button } from '../../shared/ui/button';
import { ButtonGroup } from '../../shared/ui/button-group';
import { Input } from '../../shared/ui/input';
import { useKeyboardListener } from './model/useKeyboardListener';

export const ClickerOptions = () => {
  const queryClient = useQueryClient();

  const { data: hotkeys } = useQuery({
    queryKey: ['hotkeys'],
    queryFn: (): Promise<StoredHotkey[]> => ipcActions.getHotkeys(),
  });

  const startHotkey = hotkeys?.find((hotkey) => hotkey.name === 'clicker-start');

  const updateHotkeyMutation = useMutation({
    mutationFn: (keys: number[]) => {
      if (!startHotkey) {
        throw new Error('Hotkey not found');
      }

      return ipcActions.updateHotkey({
        name: startHotkey.name,
        keys,
        mode: startHotkey.mode,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotkeys'] });
    },
  });

  const { listen, stop, isListening, pressedKeys } = useKeyboardListener({
    onRecord: (keys) => {
      updateHotkeyMutation.mutate(keys);
    },
  });

  const currentKeys = isListening ? pressedKeys : (startHotkey?.keys ?? []);
  const hotkeyLabel =
    isListening && pressedKeys.length === 0 ? 'Press shortcut…' : formatHotkeyKeys(currentKeys);

  return (
    <div className="flex gap-2">
      <div>Hotkey:</div>
      <ButtonGroup>
        <Input readOnly value={hotkeyLabel} />

        <Button variant="outline" onClick={() => (isListening ? stop() : listen())}>
          {isListening ? 'Cancel' : 'Edit'}
        </Button>
      </ButtonGroup>

      <ButtonGroup>
        <Toggle variant="outline" value="toggle" pressed={startHotkey?.mode === 'toggle'}>
          Toggle
        </Toggle>
        <Toggle variant="outline" value="hold" pressed={startHotkey?.mode === 'hold'}>
          Hold
        </Toggle>
      </ButtonGroup>
    </div>
  );
};
