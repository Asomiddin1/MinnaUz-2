"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi, 
} from "@/components/ui/carousel"

export function BannerCarousel() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const slideCount = 5

  React.useEffect(() => {
    if (!api) return

    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  return (
    <div className="w-full flex flex-col gap-3">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {Array.from({ length: slideCount }).map((_, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card className="overflow-hidden border-none shadow-sm">
                  {/* Balandlikni shu yerda chekladik: mobil uchun 160px, desktop uchun 240px */}
                  <CardContent className="flex h-[160px] md:h-[320px] items-center justify-center p-0 relative rounded-2xl overflow-hidden">
                    <img
                      src={`https://picsum.photos/seed/${index + 10}/1200/400`}
                      alt={`Banner rasm ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Dots (Nuqtalar) qismi */}
      <div className="flex justify-center gap-1.5 mt-1">
        {Array.from({ length: slideCount }).map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              current === index ? "w-6 bg-blue-600 dark:bg-blue-500" : "w-1.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700"
            }`}
            aria-label={`Slayd ${index + 1} ga o'tish`}
          />
        ))}
      </div>
    </div>
  )
}