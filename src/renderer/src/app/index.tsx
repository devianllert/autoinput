import { useState } from 'react';
import { Settings } from 'lucide-react';

import { ClickerOptions } from '../features/clicker-options/ui';
import { SettingsScreen } from '../features/settings/ui';
import { Button } from '../shared/ui/button';
import { Frame } from './frame';

export const App = (): React.ReactNode => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <Frame>
      {isSettingsOpen ? (
        <SettingsScreen onBack={() => setIsSettingsOpen(false)} />
      ) : (
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 flex-col overflow-y-auto p-2 pb-12">
            <ClickerOptions />
          </div>

          <Button
            variant="secondary"
            size="icon-lg"
            className="absolute right-2 bottom-2 shadow-sm"
            aria-label="Open settings"
            title="Settings"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings />
          </Button>
        </div>
      )}
    </Frame>
  );
};
