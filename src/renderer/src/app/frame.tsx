import { Minus, X } from 'lucide-react';

import { useClickerRunning } from '@/renderer/shared/hooks/use-clicker-running';
import { cn } from '@/renderer/shared/lib/cn';

import { ipcActions } from '../shared/api/ipc-client';
import { Button } from '../shared/ui/button';

export const Frame = ({ children }: React.PropsWithChildren): React.ReactNode => {
  const isClickerRunning = useClickerRunning();
  const handleMinimize = () => {
    void ipcActions.minimize();
  };

  const handleClose = () => {
    void ipcActions.close();
  };

  return (
    <div className="flex h-screen w-screen flex-col">
      <div className="bg-card flex h-9 w-full px-2 py-1 pr-1 [app-region:drag]">
        <div className="flex h-full w-full items-center">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'size-2 rounded-full transition-colors',
                isClickerRunning ? 'bg-green-500' : 'bg-muted',
              )}
            />
            <h1 className="text-sm font-bold">AutoClicker</h1>
          </div>

          <div className="ml-auto flex items-center gap-1 [app-region:no-drag]">
            <Button variant="ghost" size="icon" onClick={handleMinimize}>
              <Minus className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              className="dark:hover:bg-destructive/10 hover:text-destructive"
              size="icon"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card flex flex-1 flex-col gap-2 p-1 pt-0">
        <div className="bg-background flex flex-1 flex-col rounded-md">{children}</div>
      </div>
    </div>
  );
};
