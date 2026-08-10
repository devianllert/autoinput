import { useMutation } from '@tanstack/react-query';
import { Accessibility, ExternalLink, RotateCcw } from 'lucide-react';

import { useAccessibilityPermission } from '../features/accessibility-permission/model/use-accessibility-permission';
import { ipcActions } from '../shared/api/ipc-client';
import { Button } from '../shared/ui/button';

export const AccessibilityPermissionScreen = (): React.ReactNode => {
  const permissionQuery = useAccessibilityPermission();

  const requestMutation = useMutation({
    mutationFn: () => ipcActions.requestAccessibilityPermission(),
  });
  const settingsMutation = useMutation({
    mutationFn: () => ipcActions.openAccessibilitySettings(),
  });
  const restartMutation = useMutation({
    mutationFn: () => ipcActions.restartApplication(),
  });

  const hasError = requestMutation.isError || settingsMutation.isError || restartMutation.isError;

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="flex max-w-sm flex-col items-center text-center">
        <div className="bg-muted mb-4 flex size-12 items-center justify-center rounded-xl">
          <Accessibility className="size-6" />
        </div>

        <h2 className="text-lg font-semibold">Accessibility access required</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          AutoInput needs this permission to listen for global hotkeys and send mouse and keyboard
          input. The clicker will remain disabled until access is granted.
        </p>

        <div className="mt-5 flex w-full flex-col gap-2">
          <Button
            size="lg"
            disabled={permissionQuery.isPending || requestMutation.isPending}
            onClick={() => requestMutation.mutate()}
          >
            {permissionQuery.isPending ? 'Checking access…' : 'Request access'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            disabled={settingsMutation.isPending}
            onClick={() => settingsMutation.mutate()}
          >
            Open System Settings
            <ExternalLink data-icon="inline-end" />
          </Button>
          <Button
            variant="secondary"
            size="lg"
            disabled={restartMutation.isPending}
            onClick={() => restartMutation.mutate()}
          >
            <RotateCcw data-icon="inline-start" />
            Restart AutoInput
          </Button>
        </div>

        <p className="text-muted-foreground mt-4 text-xs">
          Enable AutoInput in Privacy &amp; Security → Accessibility, then restart the application
          to apply the permission.
        </p>

        {hasError && (
          <p className="text-destructive mt-3 text-xs">
            The action could not be completed. Please try again.
          </p>
        )}
      </div>
    </main>
  );
};
