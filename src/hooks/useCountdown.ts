"use client";

import { useState, useEffect } from "react";

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
  /** "critical" < 1h | "urgent" < 24h | "normal" >= 24h | "expired" */
  urgency: "critical" | "urgent" | "normal" | "expired";
  label: string; // formatted string e.g. "2d 5h 30m" or "45s"
}

/**
 * Live countdown hook.
 * Pass an ISO date string (endDate). Updates every second.
 * Returns structured time breakdown + urgency level + human label.
 */
export function useCountdown(endDate: string | null | undefined): CountdownResult {
  const calcRemaining = (): CountdownResult => {
    if (!endDate) {
      return {
        days: 0, hours: 0, minutes: 0, seconds: 0,
        totalSeconds: 0, isExpired: true, urgency: "expired",
        label: "No end date",
      };
    }

    const diff = Math.max(0, Math.floor((new Date(endDate).getTime() - Date.now()) / 1000));

    if (diff === 0) {
      return {
        days: 0, hours: 0, minutes: 0, seconds: 0,
        totalSeconds: 0, isExpired: true, urgency: "expired",
        label: "Ended",
      };
    }

    const days    = Math.floor(diff / 86400);
    const hours   = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    let urgency: CountdownResult["urgency"];
    let label: string;

    if (diff < 3600) {
      urgency = "critical";
      label = minutes > 0 ? `${minutes}m ${String(seconds).padStart(2, "0")}s` : `${seconds}s`;
    } else if (diff < 86400) {
      urgency = "urgent";
      label = `${hours}h ${String(minutes).padStart(2, "0")}m`;
    } else {
      urgency = "normal";
      label = days === 1 ? `1d ${hours}h` : `${days}d ${hours}h`;
    }

    return { days, hours, minutes, seconds, totalSeconds: diff, isExpired: false, urgency, label };
  };

  const [state, setState] = useState<CountdownResult>(calcRemaining);

  useEffect(() => {
    if (!endDate) return;

    const tick = () => setState(calcRemaining());
    tick(); // sync immediately

    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDate]);

  return state;
}
