import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { AppInfo } from '../features/settings/ui/app-info';
import { AppUpdateInfo } from '../features/settings/ui/app-update-info';
import { AutoLaunchSetting } from '../features/settings/ui/auto-launch-setting';
import { APP_ROUTES } from '../shared/routes';
import { Button } from '../shared/ui/button';

export const SettingsScreen = (): React.ReactNode => {
  const navigate = useNavigate();

  return (
    <section className="flex flex-1 flex-col" aria-labelledby="settings-title">
      <header className="flex items-center gap-2 border-b p-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Back to main screen"
          title="Back"
          onClick={() => navigate(APP_ROUTES.main)}
        >
          <ArrowLeft />
        </Button>

        <h2 id="settings-title" className="text-sm font-semibold">
          Settings
        </h2>
      </header>

      <div className="flex flex-1 flex-col gap-2 p-2">
        <div className="bg-card flex flex-col gap-3 rounded-lg p-3">
          <AppInfo />
          <AppUpdateInfo />
        </div>
        <AutoLaunchSetting />
      </div>
    </section>
  );
};
