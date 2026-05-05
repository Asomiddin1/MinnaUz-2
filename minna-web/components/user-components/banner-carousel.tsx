import React, { useState } from 'react'
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { StreakCalendar } from './streak-calendar'

const BannerCarousel = () => {
  const [date, setDate] = useState<Date | undefined>(new Date())

  const banners = [
    { 
      id: 1, 
      imageUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80", 
      alt: "Banner 1" 
    },
    { 
      id: 2, 
      imageUrl: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&q=80", 
      alt: "Banner 2" 
    },
    { 
      id: 3, 
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80", 
      alt: "Banner 3" 
    },
  ]

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 md:p-6">
      
      {/* Grid 10 ta ustunga bo'lindi (70/30 nisbatni chiqarish uchun) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch">
        <div className="lg:col-span-7 w-full">
          <Carousel className="w-full h-full">
            <CarouselContent className="h-full">
              {banners.map((banner) => (
                <CarouselItem key={banner.id} className="h-full">
                  <div className="relative w-full h-full min-h-[300px] overflow-hidden rounded-xl shadow-md">
                    <img 
                      src={banner.imageUrl} 
                      alt={banner.alt} 
                      className="absolute inset-0 w-full h-full object-cover" 
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </div>
          </Carousel>
        </div>

        {/* O'NG TARAF: Calendar (Katta ekranda 30% yoki 3 ta ustunni egallaydi) */}
        <div className="hidden lg:block lg:col-span-3 w-full">
          {/* <StreakCalendar /> */}
        </div>

      </div>
    </div>
  )
}

export default BannerCarousel