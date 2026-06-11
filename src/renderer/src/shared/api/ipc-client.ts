import { createClient, createEventHandlers } from '@egoist/tipc/renderer';

import { IPCRouter } from '@/main/ipc/actions';
import { RendererHandlers } from '@/main/ipc/listeners';

export const ipcActions = createClient<IPCRouter>({
  // pass ipcRenderer.invoke function to the client
  // you can expose it from preload.js in BrowserWindow
  // eslint-disable-next-line @typescript-eslint/unbound-method
  ipcInvoke: window.electron.ipcRenderer.invoke,
});

export const ipcListeners = createEventHandlers<RendererHandlers>({
  // when using electron's ipcRenderer directly
  on: (channel, callback) => {
    const removeListener = window.electron.ipcRenderer.on(channel, callback);

    return removeListener;
  },

  // otherwise if using @electron-toolkit/preload or electron-vite
  // which expose a custom `on` method that does the above for you
  // on: window.electron.ipcRenderer.on,
  // eslint-disable-next-line @typescript-eslint/unbound-method
  send: window.electron.ipcRenderer.send,
});
