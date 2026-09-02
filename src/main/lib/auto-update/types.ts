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
  downloadPercent: number;
  disabledReason: UpdaterDisabledReason | null;
}
