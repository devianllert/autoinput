import { tipc } from '@egoist/tipc/main';

import { getMainWindow } from '../../windows/main';

const t = tipc.create();

export const windowRouter = {
  minimize: t.procedure.action(async () => {
    const window = getMainWindow();
    window.minimize();

    return Promise.resolve();
  }),
  close: t.procedure.action(async () => {
    const window = getMainWindow();
    window.close();

    return Promise.resolve();
  }),
};
