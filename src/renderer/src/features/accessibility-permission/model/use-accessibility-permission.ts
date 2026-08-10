import { useQuery } from '@tanstack/react-query';

import { ipcActions } from '@/renderer/shared/api/ipc-client';

export const ACCESSIBILITY_PERMISSION_QUERY_KEY = ['accessibility-permission'] as const;

export const useAccessibilityPermission = () => {
  return useQuery({
    queryKey: ACCESSIBILITY_PERMISSION_QUERY_KEY,
    queryFn: () => ipcActions.getAccessibilityPermissionState(),
  });
};
