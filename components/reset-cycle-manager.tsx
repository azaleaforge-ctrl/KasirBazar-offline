"use client";

import { useEffect } from "react";
import { performCycleCheck } from "@/lib/reset-cycle";
import { useSystemToast } from "@/lib/system-toast";

/** Runs the 30-day cycle check on app load; renders nothing. */
export function ResetCycleManager() {
  useEffect(() => {
    performCycleCheck()
      .then((didClear) => {
        if (didClear) {
          useSystemToast
            .getState()
            .show("Reset otomatis selesai, akan refresh otomatis 5 detik lagi");
        }
      })
      .catch(() => {});
  }, []);
  return null;
}
