// hooks/useGooglePopupLogin.ts (takomillashgan)
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useGooglePopupLogin() {
  const { data: session, status } = useSession();
  const [popup, setPopup] = useState<Window | null>(null);
  const router = useRouter();

  const openPopup = () => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const newPopup = window.open(
      `${window.location.origin}/auth/google-signin`,
      "GoogleSignIn",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    setPopup(newPopup);
  };

  useEffect(() => {
    if (!popup) return;

    if (status === "authenticated" && session) {
      if (!popup.closed) {
        popup.close();
      }
      const role = (session.user as any)?.role;
      router.push(role === "admin" ? "/admin" : "/dashboard");
      setPopup(null);
      return;
    }

    const interval = setInterval(() => {
      if (popup.closed) {
        clearInterval(interval);
        setPopup(null);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [status, session, popup, router]);

  return { openPopup, popup };
}