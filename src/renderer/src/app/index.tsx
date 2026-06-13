import { ClickerOptions } from '../features/clicker-options/ui';
import { Frame } from './frame';

export const App = (): React.ReactNode => {
  return (
    <Frame>
      <div className="flex flex-1 flex-col p-2">
        <div className="flex flex-col gap-2">
          <ClickerOptions />
        </div>
      </div>
    </Frame>
  );
};
