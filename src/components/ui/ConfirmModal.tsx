"use client";

import { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
}: ConfirmModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return { icon: "⚠️", btnClass: "bg-red-500 hover:bg-red-600 text-white" };
      case "warning":
        return { icon: "⚡", btnClass: "bg-orange hover:bg-orange-dark text-white" };
      case "info":
        return { icon: "ℹ️", btnClass: "bg-teal hover:bg-teal-dark text-white" };
      default:
        return { icon: "⚠️", btnClass: "bg-red-500 hover:bg-red-600 text-white" };
    }
  };

  const { icon, btnClass } = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/50 pointer-events-none">
      <div className="bg-cream border-4 border-dark rounded-2xl p-6 max-w-md w-full shadow-lg pointer-events-auto">
        {/* Icon */}
        <div className="text-center mb-4">
          <span className="text-5xl">{icon}</span>
        </div>

        {/* Title */}
        <h3 className="font-display text-2xl text-dark text-center mb-3">{title}</h3>

        {/* Message */}
        <p className="font-body text-dark text-center mb-6">{message}</p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl font-body font-bold border-2 border-dark text-dark hover:bg-sand transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 rounded-xl font-body font-bold transition-colors ${btnClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

interface AlertDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onOk: () => void;
}

export function AlertDialog({ isOpen, title, message, onOk }: AlertDialogProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      title={title}
      message={message}
      confirmText="OK"
      cancelText=""
      onConfirm={onOk}
      onCancel={() => {}}
      variant="info"
    />
  );
}
