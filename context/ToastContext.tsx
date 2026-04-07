"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ToastContextType {
  showToast: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
    setTimeout(() => setVisible(false), 2800);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-7 left-1/2 z-[500] whitespace-nowrap rounded-full px-7 py-3 font-barlow-condensed text-sm font-bold tracking-wide text-white shadow-lg transition-all duration-300"
        style={{
          background: "var(--green)",
          boxShadow: "0 6px 24px rgba(10,140,42,0.5)",
          transform: visible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(70px)",
          opacity: visible ? 1 : 0,
          pointerEvents: "none",
          fontFamily: "'Barlow Condensed', sans-serif",
          letterSpacing: "1px",
        }}
      >
        {message}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
