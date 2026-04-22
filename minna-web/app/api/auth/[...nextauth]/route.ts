import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    // 🔵 GOOGLE LOGIN
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
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
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`,
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
            token: data.access_token,
            image: data.user?.image || null,
          }
        }

        return null
      },
    }),
  ],

  callbacks: {
    // 🧠 JWT (TOKEN SAQLASH)
    async jwt({ token, user, account }) {
      if (account && user) {
        
        // 🔵 GOOGLE LOGIN
        if (account.provider === "google") {
          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`,
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

              // fallback safe user mapping
              token.user = {
                name: data.user?.name || user.name,
                email: data.user?.email || user.email,
                image: data.user?.image || user.image,
                role: data.user?.role || "user",
              }
            } else {
              // ⚠️ fallback agar backend ishlamasa
              token.user = {
                name: user.name,
                email: user.email,
                image: user.image,
                role: "user",
              }
            }
          } catch (error) {
            console.error("Google login error:", error)

            // fallback
            token.user = {
              name: user.name,
              email: user.email,
              image: user.image,
              role: "user",
            }
          }
        }

        // 🟡 CREDENTIALS LOGIN
        if (account.provider === "credentials") {
          token.accessToken = (user as any).token
          token.user = user
        }
      }

      return token
    },

    // 🧾 SESSION (FRONTENDGA BERISH)
    async session({ session, token }) {
      session.user = token.user as any
      ;(session as any).accessToken = token.accessToken

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