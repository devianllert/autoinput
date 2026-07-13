export type WindowTarget = {
  id: string;
  title: string;
  processName: string;
  processPath: string | null;
};

export type WindowTargetConfig = {
  targetId: string | null;
};
