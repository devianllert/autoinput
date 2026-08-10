import { createHashRouter, Navigate } from 'react-router-dom';

import { AccessibilityPermissionScreen } from '../screens/accessibility-permission';
import { MainScreen } from '../screens/main';
import { SettingsScreen } from '../screens/settings';
import { APP_ROUTES } from '../shared/routes';
import { AccessibilityPermissionGuard } from './guards/accessibility-permission';

export const router = createHashRouter([
  {
    Component: AccessibilityPermissionGuard,
    children: [
      { path: APP_ROUTES.main, Component: MainScreen },
      { path: APP_ROUTES.settings, Component: SettingsScreen },
      { path: APP_ROUTES.accessibility, Component: AccessibilityPermissionScreen },
      { path: '*', element: <Navigate to={APP_ROUTES.main} replace /> },
    ],
  },
]);
