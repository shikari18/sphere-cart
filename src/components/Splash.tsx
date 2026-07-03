import { useEffect, useState } from "react";

export function Splash({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 1800);
    const t2 = setTimeout(onDone, 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
      style={{ background: "var(--gradient-splash)" }}
    >
      <div className="flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-700">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-white/30 blur-2xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-full bg-white/95 flex items-center justify-center shadow-2xl">
            <div className="w-14 h-14 rounded-full border-[6px] border-primary" />
          </div>
        </div>
        <h1 className="text-white text-5xl font-extrabold tracking-tight">Sphere</h1>
        <p className="text-white/80 text-sm font-medium tracking-widest uppercase">
          Made by Sphere
        </p>
      </div>
      <div className="absolute bottom-16 flex gap-1.5">
        <span className="w-2 h-2 rounded-full bg-white/70 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-white/70 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-white/70 animate-bounce" />
      </div>
    </div>
  );
}
