import { useCallback, useEffect, useRef, useState } from 'react';

import {
  collectRecordedInputCodes,
  dedupeRecordedInputCodes,
  type RecordedInputCode,
} from '@/shared/hotkeys/dom';

interface UseKeyboardListenerProps {
  onRecord: (keys: RecordedInputCode[]) => void;
}

export const useKeyboardListener = ({ onRecord }: UseKeyboardListenerProps) => {
  const [isListening, setIsListening] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<RecordedInputCode[]>([]);
  const [recordedKeys, setRecordedKeys] = useState<RecordedInputCode[] | null>(null);
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

    const pressed: RecordedInputCode[] = [];
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

      pressed.push(...collectRecordedInputCodes(event));
      setPressedKeys(dedupeRecordedInputCodes(pressed));
    };

    const handleUp = (event: KeyboardEvent | MouseEvent) => {
      prevent(event);

      if (cancelled || (event instanceof KeyboardEvent && event.code === 'Escape')) {
        return;
      }

      const keys = dedupeRecordedInputCodes([...pressed, ...collectRecordedInputCodes(event)]);
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
