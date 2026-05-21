"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { usePathname } from "next/navigation";
import { fetchPresence, sendPresenceHeartbeat } from "../services/presence.client";
import type { PresenceState } from "../types";

const HEARTBEAT_INTERVAL_MS = 30_000;
const PRESENCE_POLL_INTERVAL_MS = 30_000;

const initialState: PresenceState = {
  onlineCount: 0,
  onlineUsers: [],
  presence: [],
  isLoading: true,
  lastUpdatedAt: null,
};

const PresenceContext = createContext<PresenceState>(initialState);

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<PresenceState>(initialState);
  const [heartbeatReady, setHeartbeatReady] = useState(false);

  usePresenceHeartbeat(pathname, setState, setHeartbeatReady);
  useTenantPresence(heartbeatReady, setState);

  const value = useMemo(() => state, [state]);

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
}

export function usePresenceHeartbeat(
  currentPage: string,
  setPresenceState?: Dispatch<SetStateAction<PresenceState>>,
  setHeartbeatReady?: Dispatch<SetStateAction<boolean>>
) {
  useEffect(() => {
    let cancelled = false;

    async function syncPresence() {
      try {
        const data = await sendPresenceHeartbeat(currentPage);
        if (cancelled) return;

        console.log("[presence] onlineCount after heartbeat", data.onlineCount);
        data.presence.forEach((record) => {
          console.log("[presence] user lastSeenAt", {
            userId: record.userId,
            lastSeenAt: record.lastSeenAt,
            isOnline: record.isOnline,
          });
        });

        setPresenceState?.({
          onlineCount: data.onlineCount,
          onlineUsers: data.onlineUsers,
          presence: data.presence,
          isLoading: false,
          lastUpdatedAt: new Date().toISOString(),
        });
        setHeartbeatReady?.(true);
      } catch (err) {
        console.error("[presence] heartbeat error", err);
        if (!cancelled) {
          setPresenceState?.((current) => ({ ...current, isLoading: false }));
        }
      }
    }

    syncPresence();
    const intervalId = setInterval(syncPresence, HEARTBEAT_INTERVAL_MS);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        syncPresence();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentPage, setHeartbeatReady, setPresenceState]);
}

export function useTenantPresence(
  enabled = true,
  setPresenceState?: Dispatch<SetStateAction<PresenceState>>
) {
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function loadPresence() {
      try {
        const data = await fetchPresence();
        if (cancelled) return;

        console.log("[presence] onlineCount from poll", data.onlineCount);
        data.presence.forEach((record) => {
          console.log("[presence] polled user lastSeenAt", {
            userId: record.userId,
            lastSeenAt: record.lastSeenAt,
            isOnline: record.isOnline,
          });
        });

        setPresenceState?.({
          onlineCount: data.onlineCount,
          onlineUsers: data.onlineUsers,
          presence: data.presence,
          isLoading: false,
          lastUpdatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("[presence] poll error", err);
        if (!cancelled) {
          setPresenceState?.((current) => ({ ...current, isLoading: false }));
        }
      }
    }

    loadPresence();
    const intervalId = setInterval(loadPresence, PRESENCE_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [enabled, setPresenceState]);
}

export function usePresence() {
  return useContext(PresenceContext);
}
