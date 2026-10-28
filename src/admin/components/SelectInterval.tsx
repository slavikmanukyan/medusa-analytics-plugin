import * as React from 'react';
import { Select } from '@medusajs/ui';
import { IntervalOption, useIntervalRange } from '../hooks/use-interval-range';

export const SelectInterval: React.FC = () => {
  const { interval, onIntervalChange } = useIntervalRange();

  return (
    <Select
      size="small"
      value={interval}
      onValueChange={(value: IntervalOption) => onIntervalChange(value)}
    >
      <Select.Trigger className="w-40">
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="30-days-ago">Последние 30 дней</Select.Item>
        <Select.Item value="60-days-ago">Последние 60 дней</Select.Item>
        <Select.Item value="90-days-ago">Последние 90 дней</Select.Item>
      </Select.Content>
    </Select>
  );
};
