export type UpdaterStatus =
  | 'idle'
  | 'disabled'
  | 'checking'
  | 'up-to-date'
  | 'downloading'
  | 'ready'
  | 'error';

export type UpdaterDisabledReason = 'development' | 'portable';

export interface UpdaterState {
  currentVersion: string;
  availableVersion: string | null;
  status: UpdaterStatus;
  isChecking: boolean;
  isDownloading: boolean;
  isDownloaded: boolean;
  downloadPercent: number;
  disabledReason: UpdaterDisabledReason | null;
}
