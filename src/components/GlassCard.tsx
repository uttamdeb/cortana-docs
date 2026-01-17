import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "strong";
}

export function GlassCard({ children, className, variant = "default" }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-6 animate-fade-in-up",
        variant === "default" ? "glass" : "glass-strong",
        className
      )}
    >
      {children}
    </div>
  );
}
