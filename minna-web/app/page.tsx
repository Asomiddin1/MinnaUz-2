import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6 relative">
        <h1 className="bg-[orange] absolute top-0 w-full text-center  py-2">Sayt hozirda test rejimda ishlamoqda !!!</h1>
      <div className="flex max-w-md min-w-0 flex-col gap-6 text-center text-sm leading-loose">
        <div>
          <h1 className="text-3xl font-bold mb-2">Yapon tilini biz bilan o'rganing!</h1>
          <p className="text-muted-foreground mb-6">
            Platformamizga xush kelibsiz. O'z bilimingizni oshiring, kunlik streaklarni saqlang va tangalar yig'ing.
          </p>

          <Button asChild className="w-full text-lg py-6 mt-2">
            <Link href="/auth/login">Platformaga kirish</Link>
          </Button>
        </div>

        <div className="font-mono text-xs text-muted-foreground">
          (Press <kbd className="bg-muted px-1 rounded">d</kbd> to toggle dark mode)
        </div>
      </div>
    </div>
  )
}