"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { userAPI } from "@/lib/api/user"

export function StreakCalendar() {
  const [isMounted, setIsMounted] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date())
  const [streakDates, setStreakDates] = React.useState<Date[]>([])
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  React.useEffect(() => {
    if (!isMounted) return;

    const fetchStreaks = async () => {
      setIsLoading(true)
      try {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth() + 1 
        const response = await userAPI.getStreaks(year, month)
        
        // Timezone (soat) xatosini oldini olish
        const datesArray = response.data.map((dateString: string) => {
          const [y, m, d] = dateString.split('-');
          return new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0); 
        })
        
        setStreakDates(datesArray)
      } catch (error) {
        console.error("Streaklarni olishda xatolik:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStreaks()
  }, [currentMonth, isMounted]) 

  const isMissedDay = (date: Date) => {
    const today = new Date();
    // Bugungi kunni aniqlash uchun soatni tungi 23:59 ga suramiz
    today.setHours(23, 59, 59, 999); 

    if (date > today) return false;

    // Sanalarni solishtirish
    const isStreak = streakDates.some(
      (streakDate) => 
        streakDate.getFullYear() === date.getFullYear() &&
        streakDate.getMonth() === date.getMonth() &&
        streakDate.getDate() === date.getDate()
    );

    return !isStreak;
  };

  if (!isMounted) {
    return (
      // Loading holatida ham qat'iy o'lchamlarni w-full va h-full ga o'zgartirdik
      <Card className="w-full h-full p-1 border-none shadow-md dark:bg-slate-900 rounded-xl flex items-center justify-center">
        <div className="text-slate-400 text-sm">Kalendar yuklanmoqda...</div>
      </Card>
    )
  }

  return (
    // Card ga w-full va h-full berildi (lg:w-[320px] va min-h-[360px] olib tashlandi)
    <Card className="w-full h-full p-1 border-none shadow-md dark:bg-slate-900 rounded-xl relative py-4 flex justify-center items-center">
      {/* CardContent ning keraksiz paddinglarini p-0 qilib olib tashladik */}
      <CardContent className="p-0 flex justify-center items-center">
        {isLoading && (
          <div className="absolute top-2 right-4 text-xs text-slate-400 animate-pulse">
            Yuklanmoqda...
          </div>
        )}

        <Calendar
          mode="single"
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={{ 
            streak: streakDates,
            missed: isMissedDay, 
          }}
          modifiersClassNames={{
            streak: "!bg-green-500 !text-white font-bold hover:!bg-green-600 focus:!bg-green-500 rounded-md",
            missed: "line-through text-slate-400 opacity-50 hover:bg-transparent", 
          }}
          className="rounded-md"
        />
      </CardContent>
    </Card>
  )
}