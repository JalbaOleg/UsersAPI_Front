import { useEffect, useState } from "react";
import { CONFIG } from "../config";

export type HealthState = "unknown" | "up" | "down";

export function useHealth(intervalMs = 30000): HealthState {
  const [state, setState] = useState<HealthState>("unknown");

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(CONFIG.apiBase + "/health");
        if (!cancelled) setState(res.ok ? "up" : "down");
      } catch {
        if (!cancelled) setState("down");
      }
    };
    void check();
    const id = setInterval(check, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs]);

  return state;
}
