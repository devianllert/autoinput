import { tipc } from '@egoist/tipc/main';
import { app } from 'electron';

import { accessibilityPermission } from '../../lib/accessibility/accessibility-permission';

const t = tipc.create();

export const permissionsRouter = {
  getAccessibilityPermissionState: t.procedure.action(async () => {
    return Promise.resolve(accessibilityPermission.check());
  }),
  requestAccessibilityPermission: t.procedure.action(async () => {
    accessibilityPermission.check(true);
    return Promise.resolve();
  }),
  openAccessibilitySettings: t.procedure.action(async () => {
    await accessibilityPermission.openSettings();
  }),
  restartApplication: t.procedure.action(() => {
    app.relaunch();
    app.exit(0);
    return Promise.resolve();
  }),
};
