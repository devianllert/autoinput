import { app, Menu, nativeImage, Tray } from 'electron';

import icon from '../../../../resources/icon.png?asset';

let tray: Tray | null = null;

const setup = (showWindow: () => void): void => {
  if (tray) return;

  const trayIcon = nativeImage.createFromPath(icon);

  if (trayIcon.isEmpty()) {
    throw new Error('Could not load the application icon for the system tray.');
  }

  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));
  tray.setToolTip('AutoInput');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Open AutoInput', click: showWindow },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() },
    ]),
  );
  tray.on('click', showWindow);
};

export const appTray = { setup } as const;
