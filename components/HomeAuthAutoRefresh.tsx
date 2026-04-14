"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/client";

const STORAGE_KEY = "homeLeaderboardRefreshedUid";

type HomeAuthAutoRefreshProps = {
  serverUid?: string | null;
};

type IdleSchedulerWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

export default function HomeAuthAutoRefresh({
  serverUid,
}: HomeAuthAutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    let timeoutId: number | null = null;
    let idleId: number | null = null;
    const idleSchedulerWindow = window as IdleSchedulerWindow;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      // If SSR already knows this user, there is no stale auth state to reconcile.
      if (serverUid && serverUid === user.uid) return;

      try {
        const lastUid = sessionStorage.getItem(STORAGE_KEY);
        if (lastUid === user.uid) return;
        sessionStorage.setItem(STORAGE_KEY, user.uid);
      } catch {
        // Ignore storage errors and still refresh.
      }

      // Schedule refresh away from active input to improve interaction timing.
      const requestIdleCallback = idleSchedulerWindow.requestIdleCallback;
      if (typeof requestIdleCallback === "function") {
        idleId = requestIdleCallback(
          () => {
            router.refresh();
          },
          { timeout: 1200 },
        );
        return;
      }

      timeoutId = window.setTimeout(() => {
        router.refresh();
      }, 0);
    });

    return () => {
      unsubscribe();

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      const cancelIdleCallback = idleSchedulerWindow.cancelIdleCallback;
      if (idleId !== null && typeof cancelIdleCallback === "function") {
        cancelIdleCallback(idleId);
      }
    };
  }, [router, serverUid]);

  return null;
}
