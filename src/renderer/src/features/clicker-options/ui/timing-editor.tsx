import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDownIcon, InfoIcon } from 'lucide-react';

import { ClickerTimingConfig } from '@/main/clicker/types';
import { ipcActions } from '@/renderer/shared/api/ipc-client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/renderer/shared/ui/dropdown-menu';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/renderer/shared/ui/input-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/renderer/shared/ui/tooltip';

import { clampCps, MAX_CLICKS_PER_SECOND } from '@/shared/clicker/limits';

type TimingUnit = 'second' | 'minute' | 'hour';

const UNIT_MULTIPLIERS: Record<TimingUnit, number> = {
  second: 1,
  minute: 60,
  hour: 3600,
};

const cpsToDisplay = (cps: number, unit: TimingUnit) => cps * UNIT_MULTIPLIERS[unit];
const displayToCps = (display: number, unit: TimingUnit) => display / UNIT_MULTIPLIERS[unit];

export const TimingEditor = () => {
  const queryClient = useQueryClient();

  const [rateUnit, setRateUnit] = useState<TimingUnit>('second');

  const { data: timing } = useQuery({
    queryKey: ['clicker-timing'],
    queryFn: () => ipcActions.getClickerTiming(),
  });

  const updateTimingMutation = useMutation({
    mutationFn: (timing: ClickerTimingConfig) => ipcActions.updateClickerTiming(timing),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['clicker-timing'] });
    },
  });

  const handleCpsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const display = Number(e.target.value);

    const cps = displayToCps(display, rateUnit);

    updateTimingMutation.mutate({ cps: clampCps(cps) });
  };

  const handleRateUnitChange = (unit: TimingUnit) => {
    if (unit === rateUnit) return;

    setRateUnit(unit);
  };

  const displayCps = timing ? cpsToDisplay(timing.cps, rateUnit) : '';

  return (
    <div className="bg-card flex w-full flex-col gap-2 rounded-lg p-2">
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger>
            <InfoIcon className="text-muted-foreground size-4" />
          </TooltipTrigger>
          <TooltipContent>
            <div>
              <p>
                The number of clicks per second, minute, or hour. Capped at {MAX_CLICKS_PER_SECOND}{' '}
                clicks/s — the practical Windows limit.
              </p>
            </div>
          </TooltipContent>
        </Tooltip>

        <div className="text-base font-semibold">Timing</div>
      </div>

      <div className="flex gap-2">
        <InputGroup>
          <InputGroupInput type="number" value={displayCps} onChange={handleCpsChange} />
          <InputGroupAddon align="inline-end">
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <InputGroupButton variant="ghost" className="text-xs">
                      clicks per {rateUnit} <ChevronDownIcon className="size-3" />
                    </InputGroupButton>
                  }
                ></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => handleRateUnitChange('second')}>
                      Second
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRateUnitChange('minute')}>
                      Minute
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRateUnitChange('hour')}>
                      Hour
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
};
