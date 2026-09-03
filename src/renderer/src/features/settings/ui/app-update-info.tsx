import { AlertCircle, CheckCircle2 } from 'lucide-react';

import type { UpdaterDisabledReason, UpdaterState, UpdaterStatus } from '@/main/lib/auto-update';
import { Alert, AlertTitle } from '@/renderer/shared/ui/alert';
import { Badge } from '@/renderer/shared/ui/badge';
import { Button } from '@/renderer/shared/ui/button';
import { Progress } from '@/renderer/shared/ui/progress';

import { useUpdaterState } from '../model/use-updater-state';

const UPDATE_CHECK_ERROR_MESSAGE = 'Failed to check for updates. Please try again later.';
const UPDATE_DOWNLOAD_ERROR_MESSAGE = 'Failed to download the update. Please try again later.';
const UPDATE_RESTART_ERROR_MESSAGE = 'Failed to restart and install the update. Please try again.';
const UPDATE_STATE_ERROR_MESSAGE = 'Failed to load update information. Please try again later.';

const DISABLED_REASON_MESSAGES: Record<UpdaterDisabledReason, string> = {
  development: 'Updater is disabled in development mode.',
  portable: 'Automatic updates are unavailable in the portable build.',
};

const STATUS_LABELS: Record<UpdaterStatus, string> = {
  idle: 'Idle',
  disabled: 'Disabled',
  checking: 'Checking',
  'up-to-date': 'Up to date',
  downloading: 'Downloading',
  ready: 'Ready to install',
  error: 'Error',
};

const getUpdaterAlertMessage = (
  updaterState: UpdaterState | undefined,
  hasQueryError: boolean,
  hasCheckError: boolean,
  hasRestartError: boolean,
): string | null => {
  if (hasQueryError) return UPDATE_STATE_ERROR_MESSAGE;
  if (hasCheckError) return UPDATE_CHECK_ERROR_MESSAGE;
  if (hasRestartError) return UPDATE_RESTART_ERROR_MESSAGE;
  if (!updaterState) return null;

  if (updaterState.status === 'error') {
    return updaterState.availableVersion
      ? UPDATE_DOWNLOAD_ERROR_MESSAGE
      : UPDATE_CHECK_ERROR_MESSAGE;
  }

  return updaterState.disabledReason ? DISABLED_REASON_MESSAGES[updaterState.disabledReason] : null;
};

export const AppUpdateInfo = (): React.ReactNode => {
  const {
    updaterState,
    queryError,
    checkError,
    restartError,
    isCheckPending,
    isRestartPending,
    checkForUpdates,
    restartToUpdate,
  } = useUpdaterState();
  const isUpToDate = updaterState?.status === 'up-to-date';
  const isActionPending = isCheckPending || isRestartPending;
  const errorMessage = getUpdaterAlertMessage(
    updaterState,
    Boolean(queryError),
    Boolean(checkError),
    Boolean(restartError),
  );
  const isCheckButtonDisabled =
    !updaterState ||
    isActionPending ||
    updaterState.status === 'checking' ||
    updaterState.status === 'downloading' ||
    updaterState.status === 'disabled';

  return (
    <div className="flex flex-col gap-3 border-t pt-3">
      <div className="flex items-start justify-between gap-4">
        <p className="text-muted-foreground text-xs">
          {updaterState?.availableVersion
            ? `Version ${updaterState.availableVersion} is available.`
            : 'Check for new releases and install when ready.'}
        </p>

        <Badge
          variant="outline"
          className={
            isUpToDate ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : undefined
          }
        >
          {isUpToDate ? <CheckCircle2 data-icon="inline-start" /> : null}
          {STATUS_LABELS[updaterState?.status ?? 'idle']}
        </Badge>
      </div>

      {updaterState?.status === 'downloading' ? (
        <div className="flex flex-col gap-1">
          <Progress value={updaterState.downloadPercent} />
          <span className="text-muted-foreground text-right text-xs">
            {updaterState.downloadPercent.toFixed(1)}%
          </span>
        </div>
      ) : null}

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>{errorMessage}</AlertTitle>
        </Alert>
      ) : null}

      <div className="flex items-center gap-2">
        <Button disabled={isCheckButtonDisabled} onClick={checkForUpdates}>
          {isCheckPending ? 'Checking...' : 'Check update'}
        </Button>
        <Button
          variant="secondary"
          disabled={isActionPending || updaterState?.status !== 'ready'}
          onClick={restartToUpdate}
        >
          {isRestartPending ? 'Restarting...' : 'Restart to update'}
        </Button>
      </div>
    </div>
  );
};
