import { HotkeyEditor } from './ui/hotkey-editor';
import { TimingEditor } from './ui/timing-editor';

export const ClickerOptions = () => {
  return (
    <div className="flex flex-col gap-2">
      <TimingEditor />
      <HotkeyEditor />
    </div>
  );
};
