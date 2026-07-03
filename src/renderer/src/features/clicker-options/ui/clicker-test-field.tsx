import { useMemo, useState } from 'react';
import { InfoIcon, RotateCcw } from 'lucide-react';

import { Button } from '@/renderer/shared/ui/button';
import { Textarea } from '@/renderer/shared/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/renderer/shared/ui/tooltip';

const countLetters = (value: string): number => {
  return (value.match(/\p{L}/gu) ?? []).length;
};

export const ClickerTestField = () => {
  const [text, setText] = useState('');
  const [clickCount, setClickCount] = useState(0);

  const letterCount = useMemo(() => countLetters(text), [text]);

  const handleMouseDown = (event: React.MouseEvent<HTMLTextAreaElement>) => {
    if (event.button === 0) {
      setClickCount((count) => count + 1);
    }
  };

  const handleReset = () => {
    setText('');
    setClickCount(0);
  };

  return (
    <div className="bg-card flex w-full flex-col gap-2 rounded-lg p-2">
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger>
            <InfoIcon className="text-muted-foreground size-4" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Focus this field, then run the clicker to verify clicks and typed input.</p>
          </TooltipContent>
        </Tooltip>

        <div className="text-base font-semibold">Test field</div>

        <div className="text-muted-foreground ml-auto flex items-center gap-3 text-sm tabular-nums">
          <span>Clicks: {clickCount}</span>
          <span>Letters: {letterCount}</span>
        </div>
      </div>

      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        onMouseDown={handleMouseDown}
        placeholder="Click and type here to test the clicker…"
        className="min-h-24"
      />

      <Button variant="outline" size="sm" className="self-end" onClick={handleReset}>
        <RotateCcw className="size-3.5" />
        Reset
      </Button>
    </div>
  );
};
