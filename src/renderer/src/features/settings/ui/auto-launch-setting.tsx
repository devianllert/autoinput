import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ipcActions } from '@/renderer/shared/api/ipc-client';
import { Switch } from '@/renderer/shared/ui/switch';

import type { AutoLaunchState } from '@/shared/settings/types';

const AUTO_LAUNCH_QUERY_KEY = ['auto-launch'] as const;

const getDescription = (state: AutoLaunchState | undefined, hasError: boolean): string => {
  if (hasError) return 'Could not update this setting. Try again.';
  if (!state) return 'Checking availability...';
  if (!state.available) return 'Available only in the installed version of AutoClicker.';

  return 'Open AutoClicker automatically on system startup.';
};

export const AutoLaunchSetting = (): React.ReactNode => {
  const queryClient = useQueryClient();
  const { data: state } = useQuery({
    queryKey: AUTO_LAUNCH_QUERY_KEY,
    queryFn: () => ipcActions.getAutoLaunchState(),
  });
  const updateMutation = useMutation({
    mutationFn: (enabled: boolean) => ipcActions.updateAutoLaunch(enabled),
    onSuccess: (nextState: AutoLaunchState) => {
      queryClient.setQueryData(AUTO_LAUNCH_QUERY_KEY, nextState);
    },
  });

  const isAvailable = state?.available ?? false;
  const description = getDescription(state, updateMutation.isError);

  return (
    <div className="bg-card flex items-center gap-4 rounded-lg p-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <label htmlFor="auto-launch" className="text-sm font-medium">
          Launch at startup
        </label>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>

      <Switch
        id="auto-launch"
        checked={state?.enabled ?? false}
        disabled={!isAvailable || updateMutation.isPending}
        aria-label="Launch AutoClicker at startup"
        onCheckedChange={(checked) => updateMutation.mutate(checked)}
      />
    </div>
  );
};
