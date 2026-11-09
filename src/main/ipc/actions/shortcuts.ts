import { tipc } from '@egoist/tipc/main';

import { CLICKER_HOTKEY_NAME } from '@/shared/clicker/key-conflict';

import { assertNoKeyConflict } from '../../clicker/key-conflict';
import { getClickerConfig } from '../../clicker/store';
import { registerHotkeys } from '../../hotkeys/hotkeys';
import { StoredHotkey } from '../../hotkeys/list';
import { getHotkeys, updateHotkey } from '../../hotkeys/store';

const t = tipc.create();

export const shortcutsRouter = {
  updateHotkey: t.procedure.input<StoredHotkey>().action(async ({ input }) => {
    if (input.name === CLICKER_HOTKEY_NAME) {
      assertNoKeyConflict(input.keys, getClickerConfig().keys);
    }

    updateHotkey(input);
    registerHotkeys();

    return Promise.resolve();
  }),
  getHotkeys: t.procedure.action(async () => {
    return Promise.resolve(getHotkeys());
  }),
};
