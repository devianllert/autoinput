import { useCallback, useEffect, useRef, useState } from 'react';

import { collectUiohookCodes } from '@/shared/hotkeys/dom';

interface UseKeyboardListenerProps {
  onRecord: (keys: number[]) => void;
}

export const useKeyboardListener = ({ onRecord }: UseKeyboardListenerProps) => {
  const [isListening, setIsListening] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<number[]>([]);
  const [recordedKeys, setRecordedKeys] = useState<number[] | null>(null);
  const onRecordRef = useRef(onRecord);

  useEffect(() => {
    onRecordRef.current = onRecord;
  }, [onRecord]);

  const stop = useCallback(() => {
    setIsListening(false);
    setPressedKeys([]);
  }, []);

  const listen = useCallback(() => {
    setPressedKeys([]);
    setIsListening(true);
  }, []);

  useEffect(() => {
    if (!isListening) return;

    const pressed = new Set<number>();
    let cancelled = false;

    const prevent = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const handleDown = (event: KeyboardEvent | MouseEvent) => {
      prevent(event);

      if (event instanceof KeyboardEvent && event.code === 'Escape') {
        cancelled = true;
        stop();
        return;
      }

      collectUiohookCodes(event).forEach((code) => pressed.add(code));
      setPressedKeys([...pressed]);
    };

    const handleUp = (event: KeyboardEvent | MouseEvent) => {
      prevent(event);

      if (cancelled || (event instanceof KeyboardEvent && event.code === 'Escape')) {
        return;
      }

      const keys = [...new Set([...pressed, ...collectUiohookCodes(event)])];
      setIsListening(false);
      setPressedKeys([]);

      if (keys.length > 0) {
        setRecordedKeys(keys);
        onRecordRef.current(keys);
      }
    };

    window.addEventListener('keydown', handleDown, true);
    window.addEventListener('keyup', handleUp, true);
    window.addEventListener('mousedown', handleDown, true);
    window.addEventListener('mouseup', handleUp, true);
    window.addEventListener('blur', stop);
    window.addEventListener('contextmenu', prevent, true);

    return () => {
      window.removeEventListener('keydown', handleDown, true);
      window.removeEventListener('keyup', handleUp, true);
      window.removeEventListener('mousedown', handleDown, true);
      window.removeEventListener('mouseup', handleUp, true);
      window.removeEventListener('blur', stop);
      window.removeEventListener('contextmenu', prevent, true);
    };
  }, [isListening, stop]);

  return {
    listen,
    stop,
    isListening,
    pressedKeys,
    recordedKeys,
  };
};
