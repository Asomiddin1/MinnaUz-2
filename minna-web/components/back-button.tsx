"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

const BackButton = () => {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="mb-4 flex items-center gap-2 text-blue-500 transition hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
    >
      <ArrowLeft className="h-5 w-5" />
      Orqaga
    </button>
  )
}

export default BackButton