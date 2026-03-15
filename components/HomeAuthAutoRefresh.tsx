"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/client";

const STORAGE_KEY = "homeLeaderboardRefreshedUid";

export default function HomeAuthAutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      try {
        const lastUid = sessionStorage.getItem(STORAGE_KEY);
        if (lastUid === user.uid) return;
        sessionStorage.setItem(STORAGE_KEY, user.uid);
      } catch {
        // Ignore storage errors and still refresh.
      }

      router.refresh();
    });

    return () => unsubscribe();
  }, [router]);

  return null;
}
