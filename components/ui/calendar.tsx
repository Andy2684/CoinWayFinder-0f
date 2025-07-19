import * as React from "react"
import { Calendar as CalendarPrimitive } from "@/components/ui/calendar-primitive"

export function Calendar({ ...props }: React.ComponentProps<typeof CalendarPrimitive>) {
  return <CalendarPrimitive {...props} />
}
