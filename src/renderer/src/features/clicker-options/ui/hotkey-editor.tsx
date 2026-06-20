import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { InfoIcon } from 'lucide-react';

import { ipcActions } from '@/renderer/shared/api/ipc-client';
import { Button } from '@/renderer/shared/ui/button';
import { ButtonGroup } from '@/renderer/shared/ui/button-group';
import { Input } from '@/renderer/shared/ui/input';
import { Separator } from '@/renderer/shared/ui/separator';
import { Toggle } from '@/renderer/shared/ui/toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/renderer/shared/ui/tooltip';

import { formatHotkeyKeys } from '@/shared/hotkeys/keys';

import { useKeyboardListener } from '../model/useKeyboardListener';

export const HotkeyEditor = () => {
  const queryClient = useQueryClient();

  const { data: startHotkey } = useQuery({
    queryKey: ['hotkeys', 'clicker-toggle'],
    queryFn: () => ipcActions.getHotkeys(),
    select: (data) => data.find((hotkey) => hotkey.name === 'clicker-start'),
  });

  const updateHotkeyMutation = useMutation({
    mutationFn: (update: { keys?: number[]; mode?: 'toggle' | 'hold' }) => {
      if (!startHotkey) {
        throw new Error('Hotkey not found');
      }

      return ipcActions.updateHotkey({
        name: startHotkey.name,
        keys: update.keys ?? startHotkey.keys,
        mode: update.mode ?? startHotkey.mode,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotkeys'] });
    },
  });

  const { listen, stop, isListening, pressedKeys } = useKeyboardListener({
    onRecord: (keys) => {
      updateHotkeyMutation.mutate({ keys });
    },
  });

  const handleModeChange = (mode: 'toggle' | 'hold') => {
    updateHotkeyMutation.mutate({ mode });
  };

  const isModeDisabled = !startHotkey || updateHotkeyMutation.isPending;

  const currentKeys = isListening ? pressedKeys : (startHotkey?.keys ?? []);
  const hotkeyLabel =
    isListening && pressedKeys.length === 0 ? 'Press shortcut…' : formatHotkeyKeys(currentKeys);

  return (
    <div className="bg-card flex w-full flex-col gap-2 rounded-lg p-2">
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger>
            <InfoIcon className="text-muted-foreground size-4" />
          </TooltipTrigger>
          <TooltipContent>
            <div>
              <p>The hotkey that will toggle the clicker.</p>

              <Separator className="my-2" />

              <p>
                <span className="font-bold">Toggle</span> - Press the hotkey to turn on and then
                off.
              </p>
              <p>
                <span className="font-bold">Hold</span> - Hold the hotkey to click continuously,
                release to stop.
              </p>
            </div>
          </TooltipContent>
        </Tooltip>

        <div className="text-base font-semibold">Hotkey</div>
      </div>

      <div className="flex gap-2">
        <ButtonGroup className="w-full">
          <Input readOnly value={hotkeyLabel} />

          <Button variant="outline" onClick={() => (isListening ? stop() : listen())}>
            {isListening ? 'Cancel' : 'Edit'}
          </Button>
        </ButtonGroup>

        <ButtonGroup>
          <Toggle
            variant="outline"
            pressed={startHotkey?.mode === 'toggle'}
            disabled={isModeDisabled}
            onPressedChange={(pressed) => pressed && handleModeChange('toggle')}
          >
            Toggle
          </Toggle>
          <Toggle
            variant="outline"
            pressed={startHotkey?.mode === 'hold'}
            disabled={isModeDisabled}
            onPressedChange={(pressed) => pressed && handleModeChange('hold')}
          >
            Hold
          </Toggle>
        </ButtonGroup>
      </div>
    </div>
  );
};
