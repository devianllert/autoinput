import { tipc } from '@egoist/tipc/main';

import { registerHotkeys } from '../../hotkeys/hotkeys';
import { StoredHotkey } from '../../hotkeys/list';
import { getHotkeys, updateHotkey } from '../../hotkeys/store';

const t = tipc.create();

export const shortcutsRouter = {
  updateHotkey: t.procedure.input<StoredHotkey>().action(async ({ input }) => {
    updateHotkey(input);
    registerHotkeys();

    return Promise.resolve();
  }),
  getHotkeys: t.procedure.action(async () => {
    return Promise.resolve(getHotkeys());
  }),
};
