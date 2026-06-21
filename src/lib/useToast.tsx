"use client";
import { useState, useCallback } from "react";

type Toast = { id: number; message: string; type: "success" | "error" | "info"; exiting: boolean };

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 200);
    }, 2500);
  }, []);

  return { toasts, show };
}

export function ToastContainer({ toasts }: { toasts: ReturnType<typeof useToast>["toasts"] }) {
  return (
    <>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast${t.type === "success" ? " toast-success" : ""}${t.type === "error" ? " toast-error" : ""}${t.exiting ? " toast-exit" : ""}`}
        >
          {t.type === "success" && "✓ "}
          {t.type === "error" && "✕ "}
          {t.message}
        </div>
      ))}
    </>
  );
}