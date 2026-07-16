import { ArrowLeft } from 'lucide-react';

import { Button } from '@/renderer/shared/ui/button';

import { AppInfo } from './ui/app-info';
import { AutoLaunchSetting } from './ui/auto-launch-setting';

type SettingsScreenProps = {
  onBack: () => void;
};

export const SettingsScreen = ({ onBack }: SettingsScreenProps): React.ReactNode => {
  return (
    <section className="flex flex-1 flex-col" aria-labelledby="settings-title">
      <header className="flex items-center gap-2 border-b p-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Back to main screen"
          title="Back"
          onClick={onBack}
        >
          <ArrowLeft />
        </Button>

        <h2 id="settings-title" className="text-sm font-semibold">
          Settings
        </h2>
      </header>

      <div className="flex flex-1 flex-col gap-2 p-2">
        <AppInfo />
        <AutoLaunchSetting />
      </div>
    </section>
  );
};
