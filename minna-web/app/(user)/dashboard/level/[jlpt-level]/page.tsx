
import BackButton from "@/components/back-button"


interface PageProps {
  params: Promise<{
    "jlpt-level": string
  }>
}

const JlptLevelsPage = async ({ params }: PageProps) => {
  const resolvedParams = await params
  const level = resolvedParams["jlpt-level"]

  return (
    <div className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl">
         <BackButton />
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm dark:bg-slate-900">
          <h1 className="text-4xl font-bold uppercase text-slate-800 dark:text-white">
            {level}
          </h1>

          <p className="mt-3 text-slate-500 dark:text-slate-400">
            JLPT {level.toUpperCase()} darajasi uchun materiallar va testlar
          </p>
        </div>
      </div>
    </div>
  )
}

export default JlptLevelsPage