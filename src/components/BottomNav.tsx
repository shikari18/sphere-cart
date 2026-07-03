import { Link, useRouterState } from "@tanstack/react-router";
import { Home as HomeIcon, LayoutGrid, User } from "lucide-react";

const items = [
  { to: "/", label: "Home", Icon: HomeIcon },
  { to: "/categories", label: "Categories", Icon: LayoutGrid },
  { to: "/me", label: "Me", Icon: User },
] as const;

export function BottomNav() {
  const { location } = useRouterState();
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40">
      <div className="mx-3 mb-3 bg-white/95 backdrop-blur-xl rounded-3xl border border-border/70 shadow-[0_-8px_28px_-10px_oklch(0.2_0.02_280/0.18)] flex items-center justify-around px-2 py-2">
        {items.map(({ to, label, Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-6 rounded-2xl transition ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] ${active ? "font-bold" : "font-semibold"}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
