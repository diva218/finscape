import { createContext, useContext, useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  function showToast(message, severity = "info") {
    if (severity === "success") {
      toast.success(message);
      return;
    }
    if (severity === "error") {
      toast.error(message);
      return;
    }
    toast(message);
  }

  const value = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2600,
          style: {
            borderRadius: "999px",
            background: "linear-gradient(135deg, #fff4fa, #f3f2ff)",
            color: "#7a6385",
            border: "1px solid rgba(205,180,219,0.65)",
            boxShadow: "0 10px 24px rgba(205,180,219,0.25)"
          }
        }}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
