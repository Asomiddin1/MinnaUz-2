"use client"

import * as React from "react"
import { es } from "date-fns/locale" // Agar ispan tili kerak bo'lsa

import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"

export function StreakCalendar() {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(new Date().getFullYear(), 1, 3)
  )
  
  const bookedDates = Array.from(
    { length: 15 },
    (_, i) => new Date(new Date().getFullYear(), 1, 12 + i)
  )

  return (
    // Kalendar to'liq moslashuvchan bo'lishi uchun lg:w-fit ishlatdik
    <Card className="w-full lg:w-fit p-1 border-none shadow-sm dark:bg-slate-900 rounded-2xl">
      <CardContent className="p-0 flex justify-center">
        <Calendar
          mode="single"
          locale={es} 
          defaultMonth={date}
          selected={date}
          onSelect={setDate}
          disabled={bookedDates}
          modifiers={{
            booked: bookedDates,
          }}
          modifiersClassNames={{
            booked: "[&>button]:line-through opacity-100",
          }}
          className="rounded-xl"
        />
      </CardContent>
    </Card>
  )
}