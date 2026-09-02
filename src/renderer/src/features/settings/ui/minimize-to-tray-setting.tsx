import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ipcActions } from '@/renderer/shared/api/ipc-client';
import { Switch } from '@/renderer/shared/ui/switch';

import type { MinimizeToTrayState } from '@/shared/settings/types';

const MINIMIZE_TO_TRAY_QUERY_KEY = ['minimize-to-tray'] as const;

export const MinimizeToTraySetting = (): React.ReactNode => {
  const queryClient = useQueryClient();
  const { data: state, error: queryError } = useQuery({
    queryKey: MINIMIZE_TO_TRAY_QUERY_KEY,
    queryFn: () => ipcActions.getMinimizeToTrayState(),
  });

  const updateMutation = useMutation({
    mutationFn: (enabled: boolean) => ipcActions.updateMinimizeToTray(enabled),
    onSuccess: (nextState: MinimizeToTrayState) => {
      queryClient.setQueryData(MINIMIZE_TO_TRAY_QUERY_KEY, nextState);
    },
  });

  const description =
    queryError || updateMutation.isError
      ? 'Could not update this setting. Try again.'
      : 'When enabled, closing the window hides it in the system tray instead of quitting.';

  return (
    <div className="bg-card flex items-center gap-4 rounded-lg p-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <label htmlFor="minimize-to-tray" className="text-sm font-medium">
          Minimize to tray
        </label>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>

      <Switch
        id="minimize-to-tray"
        checked={state?.enabled ?? false}
        disabled={!state || updateMutation.isPending}
        aria-label="Minimize AutoInput to the system tray"
        onCheckedChange={(checked) => updateMutation.mutate(checked)}
      />
    </div>
  );
};
