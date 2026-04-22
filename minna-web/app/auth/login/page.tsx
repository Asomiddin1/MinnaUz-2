"use client"

import { useState } from "react"
import { getSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  
  // Mantiqiy holatlar (States)
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // 1. Google orqali kirish
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" })
  }

  // 2. Emailga OTP yuborish
 const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // 1-O'ZGARISH: /api/auth/register o'rniga /api/auth/send-otp
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        // 2-O'ZGARISH: Faqat email yuboramiz
        body: JSON.stringify({ email: email }),
      })

      const data = await res.json()

      if (res.ok) {
        setStep(2)
      } else {
        // 3-O'ZGARISH: Backenddan kelayotgan haqiqiy xato xabarini ko'rsatish
        setError(data.message || "Xatolik yuz berdi")
      }
    } catch (err) {
      setError("Server bilan ulanishda xatolik!")
    } finally {
      setLoading(false)
    }
  }
  // 3. Kodni tasdiqlash
 const handleVerifyOtp = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError("")

  const res = await signIn("credentials", {
    redirect: false,
    email: email,
    otp_code: otp,
  })

  if (res?.error) {
    setError("Kod xato yoki muddati o'tgan")
    setLoading(false)
  } else {
    const session = await getSession()
    
    // Rolga qarab yo'naltirish
    if ((session?.user as any)?.role === "admin") {
      router.push("/admin")
    } else {
      router.push("/dashboard")
    }
    
    router.refresh()
  }
}
  return (
    <div className="flex justify-center items-center w-full h-[100vh] bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{step === 1 ? "Tizimga kirish" : "Kodni tasdiqlash"}</CardTitle>
          <CardDescription>
            {step === 1 
              ? "Platformaga kirish uchun emailingizni kiriting" 
              : `${email} manziliga yuborilgan 6 xonali kodni kiriting`}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4 text-center font-medium">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form id="login-form" onSubmit={handleSendOtp}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </form>
          ) : (
            <form id="otp-form" onSubmit={handleVerifyOtp}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="otp">Tasdiqlash kodi</Label>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-muted-foreground"
                    >
                      Emailni o'zgartirish
                    </button>
                  </div>
                  <Input 
                    id="otp" 
                    type="text" 
                    placeholder="123456" 
                    maxLength={6}
                    required 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="text-center tracking-[0.5em] text-lg"
                    disabled={loading}
                  />
                </div>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex-col gap-2">
          {step === 1 ? (
            <>
              <Button type="submit" form="login-form" className="w-full" disabled={loading}>
                {loading ? "Yuborilmoqda..." : "Kodni olish"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google orqali kirish
              </Button>
            </>
          ) : (
            <Button type="submit" form="otp-form" className="w-full" disabled={loading || otp.length !== 6}>
              {loading ? "Tekshirilmoqda..." : "Tizimga kirish"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}