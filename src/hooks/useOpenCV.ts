"use client"
import { useEffect, useState } from "react";

type OpenCVStatus = "loading" | "ready" | "error";

export function useOpenCV() {
  const [status, setStatus] = useState<OpenCVStatus>("loading");

  useEffect(() => {
    if (typeof cv !== "undefined" && cv.Mat) {
      setStatus("ready");
      return;
    }

    const timeout = setTimeout(() => setStatus("error"), 30000);

    window.cv = window.cv || {};
    const originalCallback = window.cv["onRuntimeInitialized"];

    window.cv["onRuntimeInitialized"] = () => {
      originalCallback?.();
      clearTimeout(timeout);
      setStatus("ready");
    }

    return () => clearTimeout(timeout)
  }, []);

  return { isReady: status === "ready", status };
}