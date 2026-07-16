import { tipc } from '@egoist/tipc/main';

import { autoLaunch } from '../../lib/auto-launch/auto-launch';

const t = tipc.create();

export const settingsRouter = {
  getAutoLaunchState: t.procedure.action(async () => {
    return Promise.resolve(autoLaunch.getState());
  }),
  updateAutoLaunch: t.procedure.input<boolean>().action(async ({ input }) => {
    return Promise.resolve(autoLaunch.update(input));
  }),
};
