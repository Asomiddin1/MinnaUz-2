// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    // 🔵 GOOGLE LOGIN
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "select_account", 
        },
      },
    }),

    // 🟡 OTP LOGIN
    CredentialsProvider({
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp_code: { label: "OTP Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp_code) return null

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              otp_code: String(credentials.otp_code),
            }),
          }
        )

        const data = await res.json()

        if (res.ok && data.access_token) {
          return {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            is_premium: data.user.is_premium, // 👈 QO'SHILDI
            token: data.access_token,
            image: data.user?.avatar || null,
          }
        }
        return null
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        if (account.provider === "google") {
          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({
                  token: account.id_token,
                }),
              }
            )

            const data = await res.json()

            if (res.ok && data.access_token) {
              token.accessToken = data.access_token
              token.role = data.user?.role || "user"
              token.is_premium = data.user?.is_premium || false; // 👈 QO'SHILDI
              token.user = {
                name: data.user?.name || user.name,
                email: data.user?.email || user.email,
                image: data.user?.avatar || user.image,
                role: data.user?.role || "user",
                is_premium: data.user?.is_premium || false, // 👈 QO'SHILDI
              }
            } else {
              token.role = "user"
              token.is_premium = false; // 👈 QO'SHILDI
              token.user = {
                name: user.name,
                email: user.email,
                image: user.image,
                role: "user",
                is_premium: false, // 👈 QO'SHILDI
              }
            }
          } catch (error) {
            console.error("Google login error:", error)
            token.role = "user"
            token.is_premium = false; // 👈 QO'SHILDI
            token.user = {
              name: user.name,
              email: user.email,
              image: user.image,
              role: "user",
              is_premium: false, // 👈 QO'SHILDI
            }
          }
        }

        if (account.provider === "credentials") {
          token.accessToken = (user as any).token
          token.role = (user as any).role
          token.is_premium = (user as any).is_premium // 👈 QO'SHILDI
          token.user = user
        }
      }
      return token
    },

    async session({ session, token }) {
      session.user = token.user as any
      ;(session as any).accessToken = token.accessToken
      // token dagi ma'lumotni session ga yozib qo'yamiz (TypeScript ga qulay bo'lishi uchun)
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).is_premium = token.is_premium; // 👈 QO'SHILDI
      }
      
      return session
    },
  },

  pages: {
    signIn: "/auth/login", 
  },

  session: {
    strategy: "jwt",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }