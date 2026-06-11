import { Minus, X } from 'lucide-react';

import { ipcActions } from '../shared/api/ipc-client';
import { Button } from '../shared/ui/button';

export const Frame = ({ children }: React.PropsWithChildren): React.ReactNode => {
  const handleMinimize = () => {
    void ipcActions.minimize();
  };

  const handleClose = () => {
    void ipcActions.close();
  };

  return (
    <div className="flex h-screen w-screen flex-col">
      <div className="flex h-9 w-full border-b px-4 py-1 pr-1 [app-region:drag]">
        <div className="flex h-full w-full items-center">
          <div className="flex items-center">
            <h1 className="text-sm font-bold">Autoclicker</h1>
          </div>

          <div className="ml-auto [app-region:no-drag]">
            <Button variant="ghost" size="icon" onClick={handleMinimize}>
              <Minus className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
};
