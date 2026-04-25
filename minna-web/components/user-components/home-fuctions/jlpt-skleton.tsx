import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";


export default function JlptLevelsSkeleton() {
  return (
    <div className="mb-10 w-full p-3">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className="overflow-hidden rounded-[24px] border-none pt-0 shadow-sm"
          >
            <Skeleton className="aspect-video w-full rounded-none" />
            <CardContent className="flex flex-col p-5">
              <Skeleton className="mb-6 h-6 w-2/3" />
              <div className="mb-8 flex gap-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <div className="mt-auto flex items-center justify-between pt-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}