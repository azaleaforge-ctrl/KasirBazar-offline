"use client";

import { useEffect, useRef } from "react";
import { useSystemToast } from "@/lib/system-toast";

const POLL_MS = 30000;

/** Detects a new deployment by polling /version.json and prompts a refresh. */
export function DeployWatcher() {
  const shownFor = useRef<string | null>(null);

  useEffect(() => {
    let alive = true;

    const check = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { version?: string };
        const v = data.version;
        if (!v) return;
        const stored = localStorage.getItem("app-version") ?? "";
        if (!stored) {
          localStorage.setItem("app-version", v);
        } else if (v !== stored && shownFor.current !== v) {
          shownFor.current = v;
          localStorage.setItem("app-version", v);
          useSystemToast
            .getState()
            .show("Kasir Telah update, 5 detik lagi akan otomatis refresh");
        }
      } catch {
        /* ignore network errors */
      }
    };

    check();
    const id = setInterval(() => {
      if (alive) check();
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      alive = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
