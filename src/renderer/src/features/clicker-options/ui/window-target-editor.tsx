import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { InfoIcon, RefreshCwIcon } from 'lucide-react';

import { ipcActions } from '@/renderer/shared/api/ipc-client';
import { Button } from '@/renderer/shared/ui/button';
import { ButtonGroup } from '@/renderer/shared/ui/button-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/renderer/shared/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/renderer/shared/ui/tooltip';

import type { WindowTargetConfig } from '@/shared/window-target/types';

const formatTargetLabel = (target: { processName: string; title: string }): string => {
  return `${target.processName} - ${target.title}`;
};

export const WindowTargetEditor = () => {
  const queryClient = useQueryClient();

  const { data: targets = [], isFetching: isTargetsFetching } = useQuery({
    queryKey: ['window-targets'],
    queryFn: () => ipcActions.getWindowTargets(),
  });

  const { data: config } = useQuery({
    queryKey: ['window-target-config'],
    queryFn: () => ipcActions.getWindowTargetConfig(),
  });

  const updateTargetMutation = useMutation({
    mutationFn: (nextConfig: WindowTargetConfig) => ipcActions.updateWindowTargetConfig(nextConfig),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['window-target-config'] });
    },
  });

  const refreshTargets = () => {
    void queryClient.invalidateQueries({ queryKey: ['window-targets'] });
  };

  const selectedTargetId = config?.targetId ?? '';
  const selectedTarget = targets.find((target) => target.id === selectedTargetId);
  const hasSelectedTarget =
    selectedTargetId === '' || targets.some((target) => target.id === selectedTargetId);
  const selectedTargetLabel =
    selectedTargetId === ''
      ? 'Any app'
      : (selectedTarget && formatTargetLabel(selectedTarget)) || 'Unavailable selected app';

  return (
    <div className="bg-card flex w-full flex-col gap-2 rounded-lg p-2">
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger>
            <InfoIcon className="text-muted-foreground size-4" />
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Limit clicker to the selected foreground app. Leave empty to work in any app.
              <br />
              If a target is selected, the clicker starts only when that app is the active
              foreground window.
              <br />
              If the clicker is running and you switch to another app, it stops automatically.
            </p>
          </TooltipContent>
        </Tooltip>

        <div className="text-base font-semibold">Window target</div>
      </div>

      <ButtonGroup className="w-full">
        <Select
          value={selectedTargetId}
          disabled={!config || updateTargetMutation.isPending}
          onValueChange={(value) => {
            updateTargetMutation.mutate({ targetId: value || null });
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue>{selectedTargetLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} side="bottom" align="start">
            <SelectItem value="">None</SelectItem>
            {!hasSelectedTarget && (
              <SelectItem value={selectedTargetId}>Unavailable selected app</SelectItem>
            )}
            {targets.map((target) => (
              <SelectItem key={target.id} value={target.id}>
                {formatTargetLabel(target)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          disabled={isTargetsFetching}
          title="Refresh windows"
          onClick={refreshTargets}
        >
          <RefreshCwIcon className="size-4" />
        </Button>
      </ButtonGroup>
    </div>
  );
};
