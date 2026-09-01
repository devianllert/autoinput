import { ExternalLink, GitFork } from 'lucide-react';

import { Button } from '@/renderer/shared/ui/button';

const GITHUB_URL = 'https://github.com/devianllert/autoinput';

export const AppInfo = (): React.ReactNode => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-sm font-medium">AutoInput</p>
        <p className="text-muted-foreground text-xs">Version {__VERSION__}</p>
      </div>

      <Button
        variant="outline"
        render={
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="Open GitHub profile" />
        }
      >
        <GitFork data-icon="inline-start" />
        GitHub
        <ExternalLink data-icon="inline-end" />
      </Button>
    </div>
  );
};
