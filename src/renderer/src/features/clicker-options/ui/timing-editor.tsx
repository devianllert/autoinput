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
import { cpsToRate, formatRate, rateToCps, type RateUnit } from '@/shared/clicker/rate';

export const TimingEditor = () => {
  const queryClient = useQueryClient();

  const [rateUnit, setRateUnit] = useState<RateUnit>('second');

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

  const commitCps = (event: React.FocusEvent<HTMLInputElement>) => {
    if (!timing) return;

    const input = event.currentTarget;
    const currentText = formatRate(cpsToRate(timing.cps, rateUnit));
    const rate = Number(input.value);

    // Untouched, empty, or non-positive input: keep the saved rate.
    if (input.value === currentText || input.value.trim() === '' || !(rate > 0)) {
      input.value = currentText;
      return;
    }

    const nextCps = clampCps(rateToCps(rate, rateUnit));

    input.value = formatRate(cpsToRate(nextCps, rateUnit));

    if (nextCps !== timing.cps) {
      updateTimingMutation.mutate({ cps: nextCps });
    }
  };

  const handleRateUnitChange = (unit: RateUnit) => {
    if (unit === rateUnit) return;

    setRateUnit(unit);
  };

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
                The number of clicks per second, minute, or hour — from 1 click per hour up to{' '}
                {MAX_CLICKS_PER_SECOND} clicks/s, the practical Windows limit.
              </p>
            </div>
          </TooltipContent>
        </Tooltip>

        <div className="text-base font-semibold">Timing</div>
      </div>

      <div className="flex gap-2">
        <InputGroup>
          <InputGroupInput
            key={`${rateUnit}:${timing?.cps ?? 'loading'}`}
            type="number"
            defaultValue={timing ? formatRate(cpsToRate(timing.cps, rateUnit)) : ''}
            disabled={!timing}
            onBlur={commitCps}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.currentTarget.blur();
              }
            }}
          />
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
