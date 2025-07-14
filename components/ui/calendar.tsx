// components/ui/calendar.tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import type { DayPickerProps } from "react-day-picker";

export function Calendar(props: DayPickerProps) {
  return (
    <DayPicker
      {...props}
      // Приводим components к any, чтобы обойти строгую типизацию
      components={{
        IconLeft: (ChevronLeft as any),
        IconRight: (ChevronRight as any),
      } as any}
    />
  );
}
