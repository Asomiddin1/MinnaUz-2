import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  // Shu yerdan type CarouselApi ni import qilamiz
  type CarouselApi, 
} from "@/components/ui/carousel"

// Kodingizdagi mana bu qatorni O'CHIRIB TASHLAYSIZ:
// import { EmblaCarouselType } from "embla-carousel-react"

export function BannerCarousel() {
  // useState'da CarouselApi dan foydalanamiz
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
    <div className="w-full flex flex-col gap-4">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {Array.from({ length: slideCount }).map((_, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card className="overflow-hidden border-none shadow-sm">
                  <CardContent className="flex aspect-[16/9] lg:aspect-[21/9] items-center justify-center p-0 relative rounded-xl overflow-hidden">
                    <img
                      src={`https://picsum.photos/seed/${index + 10}/1200/600`}
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
      <div className="flex justify-center gap-2 mt-2">
        {Array.from({ length: slideCount }).map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              current === index ? "w-8 bg-blue-600" : "w-2.5 bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Slayd ${index + 1} ga o'tish`}
          />
        ))}
      </div>
    </div>
  )
}