import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAccessibilityPermission } from '../../features/accessibility-permission/model/use-accessibility-permission';
import { APP_ROUTES } from '../../shared/routes';
import { Frame } from '../frame';

export const AccessibilityPermissionGuard = (): React.ReactNode => {
  const location = useLocation();
  const permissionQuery = useAccessibilityPermission();
  const isMacOS = window.electron.process.platform === 'darwin';
  const isPermissionRoute = location.pathname === APP_ROUTES.accessibility;
  const isInitialMacOSCheck = isMacOS && permissionQuery.data === undefined;
  const permissionRequired =
    isInitialMacOSCheck ||
    (permissionQuery.data?.required === true && permissionQuery.data.granted === false);

  if (permissionRequired && !isPermissionRoute) {
    return <Navigate to={APP_ROUTES.accessibility} replace />;
  }

  if (!permissionRequired && isPermissionRoute) {
    return <Navigate to={APP_ROUTES.main} replace />;
  }

  return (
    <Frame>
      <Outlet />
    </Frame>
  );
};
