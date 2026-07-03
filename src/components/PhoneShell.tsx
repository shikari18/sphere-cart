import type { ReactNode } from "react";

export function PhoneShell({ children, gradient = true }: { children: ReactNode; gradient?: boolean }) {
  return (
    <div
      className="relative min-h-screen w-full max-w-md mx-auto pb-28"
      style={
        gradient
          ? {
              backgroundImage:
                "radial-gradient(ellipse 70% 45% at 100% 0%, oklch(0.62 0.22 300 / 0.22), transparent 70%), radial-gradient(ellipse 40% 30% at 0% 0%, oklch(0.75 0.15 320 / 0.12), transparent 70%)",
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
