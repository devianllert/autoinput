import { HotkeyEditor } from './ui/hotkey-editor';
import { InputEditor } from './ui/input-editor';
import { TimingEditor } from './ui/timing-editor';
import { WindowTargetEditor } from './ui/window-target-editor';

export const ClickerOptions = () => {
  const isMacOS = window.electron.process.platform === 'darwin';

  return (
    <div className="flex flex-col gap-2">
      <TimingEditor />
      {!isMacOS && <WindowTargetEditor />}
      <HotkeyEditor />
      <InputEditor />
    </div>
  );
};
