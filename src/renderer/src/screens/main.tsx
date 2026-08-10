import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ClickerOptions } from '../features/clicker-options/ui';
import { APP_ROUTES } from '../shared/routes';
import { Button } from '../shared/ui/button';

export const MainScreen = (): React.ReactNode => {
  const navigate = useNavigate();

  return (
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
        onClick={() => navigate(APP_ROUTES.settings)}
      >
        <Settings />
      </Button>
    </div>
  );
};
