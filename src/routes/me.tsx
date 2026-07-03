import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Settings,
  Package,
  Wallet,
  Heart,
  Star,
  Truck,
  Undo2,
  MessageCircle,
  Gift,
  Coins,
  MapPin,
  HelpCircle,
  ChevronRight,
  Bell,
  ShoppingBag,
  CreditCard,
  Ticket,
} from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/me")({
  component: MePage,
});

const orderStages = [
  { Icon: Wallet, label: "To Pay", count: 2 },
  { Icon: Package, label: "To Ship", count: 1 },
  { Icon: Truck, label: "Shipped", count: 3 },
  { Icon: Star, label: "Review", count: 5 },
  { Icon: Undo2, label: "Returns", count: 0 },
];

const rewards = [
  { Icon: Coins, label: "Coins", value: "1,240" },
  { Icon: Ticket, label: "Coupons", value: "8" },
  { Icon: Gift, label: "Credit", value: "$12.50" },
  { Icon: CreditCard, label: "Cards", value: "3" },
];

const menu = [
  { Icon: Heart, label: "My Wishlist", meta: "24 items" },
  { Icon: ShoppingBag, label: "Recently Viewed", meta: "" },
  { Icon: MapPin, label: "Addresses", meta: "Circle, Accra" },
  { Icon: MessageCircle, label: "Messages", meta: "" },
  { Icon: Bell, label: "Notifications", meta: "On" },
  { Icon: HelpCircle, label: "Help Center", meta: "" },
  { Icon: Settings, label: "Settings", meta: "" },
];

function MePage() {
  return (
    <PhoneShell>
      {/* Purple header */}
      <div
        className="relative rounded-b-[2rem] pt-12 pb-20 px-5 text-white overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute right-24 top-20 w-16 h-16 rounded-full bg-white/10" />

        <div className="relative flex items-center justify-between">
          <span className="text-xs font-semibold tracking-widest opacity-90">MY ACCOUNT</span>
          <Link to="/" className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </Link>
        </div>

        <div className="relative mt-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center text-2xl font-extrabold text-primary shadow-xl">
            EO
          </div>
          <div>
            <p className="text-lg font-extrabold">Emmanuel Ogar</p>
            <p className="text-xs text-white/85">Dova Member · Gold</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="text-[10px] bg-white/20 rounded-full px-2 py-0.5 font-semibold">🏆 Level 3</span>
              <span className="text-[10px] bg-white/20 rounded-full px-2 py-0.5 font-semibold">🔥 12 day streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards floating card */}
      <div className="px-4 -mt-14 relative z-10">
        <div className="bg-white rounded-2xl shadow-[var(--shadow-soft)] p-4 grid grid-cols-4 gap-2 border border-border/60">
          {rewards.map(({ Icon, label, value }) => (
            <button key={label} className="flex flex-col items-center gap-1 py-1">
              <div className="w-9 h-9 rounded-full bg-primary-soft flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-extrabold">{value}</span>
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      <section className="px-4 mt-4">
        <div className="bg-white rounded-2xl border border-border/60 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h3 className="text-sm font-bold">My Orders</h3>
            <button className="text-xs text-muted-foreground font-semibold flex items-center">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-1 px-2 pb-4">
            {orderStages.map(({ Icon, label, count }) => (
              <button key={label} className="relative flex flex-col items-center gap-1 py-2">
                <div className="relative">
                  <Icon className="w-6 h-6 text-foreground/80" />
                  {count > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-flame text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                      {count}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-foreground/80">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Promo strip */}
      <section className="px-4 mt-4">
        <div className="rounded-2xl bg-gradient-to-r from-flame/15 to-orange-50 border border-flame/20 p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-flame text-white flex items-center justify-center">
            <Gift className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">Invite friends, earn $10</p>
            <p className="text-[11px] text-muted-foreground">For every friend who joins Dova</p>
          </div>
          <button className="text-xs font-bold text-flame">Invite ›</button>
        </div>
      </section>

      {/* Menu list */}
      <section className="px-4 mt-4">
        <div className="bg-white rounded-2xl border border-border/60 shadow-[var(--shadow-card)] divide-y divide-border/60">
          {menu.map(({ Icon, label, meta }) => (
            <button key={label} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 first:rounded-t-2xl last:rounded-b-2xl transition">
              <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold flex-1 text-left">{label}</span>
              {meta && <span className="text-xs text-muted-foreground">{meta}</span>}
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </section>

      <p className="text-center text-[10px] text-muted-foreground mt-6">Dova · v1.0 · Made with ♡</p>

      <BottomNav />
    </PhoneShell>
  );
}
