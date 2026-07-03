import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { InfoIcon } from 'lucide-react';

import { ipcActions } from '@/renderer/shared/api/ipc-client';
import { Button } from '@/renderer/shared/ui/button';
import { ButtonGroup } from '@/renderer/shared/ui/button-group';
import { Input } from '@/renderer/shared/ui/input';
import { Separator } from '@/renderer/shared/ui/separator';
import { Toggle } from '@/renderer/shared/ui/toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/renderer/shared/ui/tooltip';

import { isSupportedClickerInputCode } from '@/shared/clicker/input';
import type { ClickerConfig } from '@/shared/clicker/types';
import { recordedInputCodesToUiohookCodes, type RecordedInputCode } from '@/shared/hotkeys/dom';
import { formatHotkeyKeys } from '@/shared/hotkeys/keys';

import { useKeyboardListener } from '../model/useKeyboardListener';

const recordedCodesToClickerKeys = (codes: RecordedInputCode[]): number[] =>
  recordedInputCodesToUiohookCodes(codes).filter((code) => isSupportedClickerInputCode(code));

export const InputEditor = () => {
  const queryClient = useQueryClient();

  const { data: config } = useQuery({
    queryKey: ['clicker-config'],
    queryFn: () => ipcActions.getClickerConfig(),
  });

  const updateConfigMutation = useMutation({
    mutationFn: (update: Partial<ClickerConfig>) => {
      if (!config) {
        throw new Error('Clicker config not loaded');
      }

      return ipcActions.updateClickerConfig({
        keys: update.keys ?? config.keys,
        mode: update.mode ?? config.mode,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['clicker-config'] });
    },
  });

  const { listen, stop, isListening, pressedKeys } = useKeyboardListener({
    onRecord: (recordedCodes) => {
      const keys = recordedCodesToClickerKeys(recordedCodes);

      if (keys.length === 0) {
        return;
      }

      updateConfigMutation.mutate({ keys });
    },
  });

  const handleModeChange = (mode: ClickerConfig['mode']) => {
    updateConfigMutation.mutate({ mode });
  };

  const isModeDisabled = !config || updateConfigMutation.isPending;

  const currentKeys = isListening ? recordedCodesToClickerKeys(pressedKeys) : (config?.keys ?? []);
  const inputLabel =
    isListening && currentKeys.length === 0 ? 'Press keys…' : formatHotkeyKeys(currentKeys);

  return (
    <div className="bg-card flex w-full flex-col gap-2 rounded-lg p-2">
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger>
            <InfoIcon className="text-muted-foreground size-4" />
          </TooltipTrigger>
          <TooltipContent>
            <div>
              <p>The button or key combination the clicker will press.</p>

              <Separator className="my-2" />

              <p>
                <span className="font-bold">Press</span> - tap the input on every click cycle.
              </p>
              <p>
                <span className="font-bold">Hold</span> - keep the input held while the clicker
                runs.
              </p>
            </div>
          </TooltipContent>
        </Tooltip>

        <div className="text-base font-semibold">Input</div>
      </div>

      <div className="flex gap-2">
        <ButtonGroup className="w-full">
          <Input readOnly value={inputLabel} />

          <Button variant="outline" onClick={() => (isListening ? stop() : listen())}>
            {isListening ? 'Cancel' : 'Edit'}
          </Button>
        </ButtonGroup>

        <ButtonGroup>
          <Toggle
            variant="outline"
            pressed={config?.mode === 'press'}
            disabled={isModeDisabled}
            onPressedChange={(pressed) => pressed && handleModeChange('press')}
          >
            Press
          </Toggle>
          <Toggle
            variant="outline"
            pressed={config?.mode === 'hold'}
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
