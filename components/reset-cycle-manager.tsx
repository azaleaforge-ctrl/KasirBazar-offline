"use client";

import { useEffect } from "react";
import { performCycleCheck } from "@/lib/reset-cycle";

/** Runs the 30-day cycle check on app load; renders nothing. */
export function ResetCycleManager() {
  useEffect(() => {
    performCycleCheck().catch(() => {});
  }, []);
  return null;
}
