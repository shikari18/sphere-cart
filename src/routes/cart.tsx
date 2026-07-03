import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ChevronLeft, MoreVertical, Check, Trash2, Clock, MapPin, ShoppingCart, Loader2, CheckCircle2, XCircle, Lock } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { BottomNav } from "@/components/BottomNav";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { createCjOrder } from "@/lib/cj-api";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

type CheckoutStep = "cart" | "shipping" | "submitting" | "success" | "error";

function CartPage() {
  const { items, removeItem, updateQty, clearCart, count } = useCart();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("cart");
  const [orderError, setOrderError] = useState("");
  const [placedOrderId, setPlacedOrderId] = useState("");

  // Shipping Form State — pre-filled from user profile
  const [shipping, setShipping] = useState({
    customerName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    countryCode: "GH",
    province: "",
    city: "",
    address: user?.address || "",
    address2: "",
    zip: "",
  });

  // Update shipping when user logs in
  useEffect(() => {
    if (user) {
      setShipping((s) => ({
        ...s,
        customerName: user.name || s.customerName,
        email: user.email || s.email,
        phone: user.phone || s.phone,
        address: user.address || s.address,
      }));
    }
  }, [user]);

  const toggle = (id: string) =>
    setChecked((c) => ({ ...c, [id]: !c[id] }));

  const allSelected = items.length > 0 && items.every((c) => checked[c.id] !== false);

  const selected = items.filter((c) => checked[c.id] !== false);
  const selectedTotal = selected.reduce((s, c) => s + c.price * c.qty, 0);
  const savings = selected.reduce((s, c) => s + (c.original - c.price) * c.qty, 0);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep("submitting");
    setOrderError("");

    try {
      // Map cart products to CJ Drop shipping variants
      const orderProducts = selected.map((item) => {
        // Fallback to item.id if no vid exists
        return {
          vid: item.vid || item.id,
          quantity: item.qty,
        };
      });

      const response = await createCjOrder({
        data: {
          customerName: shipping.customerName,
          email: shipping.email,
          phone: shipping.phone,
          countryCode: shipping.countryCode,
          province: shipping.province,
          city: shipping.city,
          address: shipping.address,
          address2: shipping.address2 || undefined,
          zip: shipping.zip,
          products: orderProducts,
        }
      });

      if (response.success) {
        setPlacedOrderId(response.orderId);
        clearCart();
        setCheckoutStep("success");
      } else {
        throw new Error(response.message || "Failed to place order. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setOrderError(err.message || "Failed to submit order. Please try again.");
      setCheckoutStep("error");
    }
  };

  if (checkoutStep === "submitting") {
    return (
      <PhoneShell gradient={false}>
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary mb-6" />
          <h2 className="text-xl font-extrabold mb-2">Processing Order</h2>
          <p className="text-sm text-muted-foreground">
            Processing your order...
          </p>
        </div>
      </PhoneShell>
    );
  }

  if (checkoutStep === "success") {
    return (
      <PhoneShell gradient={false}>
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
          <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-6 animate-bounce" />
          <h2 className="text-2xl font-extrabold mb-2 text-emerald-600">Order Placed!</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Your order was placed successfully!
          </p>
          <div className="bg-secondary rounded-2xl p-4 w-full mb-8 border border-border/40">
            <span className="text-xs text-muted-foreground block mb-1">Order Number</span>
            <span className="font-mono font-bold text-foreground text-sm">{placedOrderId}</span>
          </div>
          <Link
            to="/"
            onClick={() => setCheckoutStep("cart")}
            className="w-full bg-primary text-primary-foreground font-extrabold py-3.5 rounded-full hover:opacity-90 active:scale-[0.98] transition shadow-lg text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </PhoneShell>
    );
  }

  if (checkoutStep === "error") {
    return (
      <PhoneShell gradient={false}>
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
          <XCircle className="w-20 h-20 text-destructive mb-6" />
          <h2 className="text-2xl font-extrabold mb-2 text-destructive">Submission Failed</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {orderError}
          </p>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => setCheckoutStep("shipping")}
              className="w-full bg-destructive text-white font-extrabold py-3.5 rounded-full hover:opacity-90 active:scale-[0.98] transition shadow-lg"
            >
              Try Again
            </button>
            <button
              onClick={() => setCheckoutStep("cart")}
              className="w-full bg-secondary text-foreground font-bold py-3.5 rounded-full hover:bg-secondary/80 active:scale-[0.98] transition"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </PhoneShell>
    );
  }

  if (checkoutStep === "shipping") {
    return (
      <PhoneShell gradient={false}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-border/60">
          <div className="flex items-center gap-2 px-4 pt-5 pb-3">
            <button
              onClick={() => setCheckoutStep("cart")}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-extrabold text-base">Shipping Details</span>
          </div>
        </header>

        <form onSubmit={handleCheckoutSubmit} className="p-4 flex flex-col gap-4 pb-24">
          <div className="bg-secondary/50 rounded-2xl p-4 border border-border/40 mb-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Order Summary</h3>
            <div className="flex justify-between items-center text-sm font-semibold">
              <span>Items ({selected.length})</span>
              <span>₵{selectedTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground/80">Recipient Full Name</label>
            <input
              type="text"
              required
              value={shipping.customerName}
              onChange={(e) => setShipping({ ...shipping, customerName: e.target.value })}
              className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm bg-white outline-none focus:border-primary transition"
              placeholder="e.g. Emmanuel Ogar"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground/80">Email</label>
              <input
                type="email"
                required
                value={shipping.email}
                onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm bg-white outline-none focus:border-primary transition"
                placeholder="e.g. emmanuel@example.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground/80">Phone Number</label>
              <input
                type="text"
                required
                value={shipping.phone}
                onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm bg-white outline-none focus:border-primary transition"
                placeholder="e.g. +1234567890"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground/80">Country Code</label>
              <select
                value={shipping.countryCode}
                onChange={(e) => setShipping({ ...shipping, countryCode: e.target.value })}
                className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm bg-white outline-none focus:border-primary transition"
              >
                <option value="US">United States (US)</option>
                <option value="GH">Ghana (GH)</option>
                <option value="GB">United Kingdom (GB)</option>
                <option value="CA">Canada (CA)</option>
                <option value="DE">Germany (DE)</option>
                <option value="FR">France (FR)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground/80">Province / State</label>
              <input
                type="text"
                required
                value={shipping.province}
                onChange={(e) => setShipping({ ...shipping, province: e.target.value })}
                className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm bg-white outline-none focus:border-primary transition"
                placeholder="e.g. California"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground/80">City</label>
              <input
                type="text"
                required
                value={shipping.city}
                onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm bg-white outline-none focus:border-primary transition"
                placeholder="e.g. Los Angeles"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground/80">Zip / Postal Code</label>
              <input
                type="text"
                required
                value={shipping.zip}
                onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
                className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm bg-white outline-none focus:border-primary transition"
                placeholder="e.g. 90024"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground/80">Street Address</label>
            <input
              type="text"
              required
              value={shipping.address}
              onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
              className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm bg-white outline-none focus:border-primary transition"
              placeholder="e.g. 1024 Westwood Blvd"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground/80">Address Line 2 (Optional)</label>
            <input
              type="text"
              value={shipping.address2}
              onChange={(e) => setShipping({ ...shipping, address2: e.target.value })}
              className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm bg-white outline-none focus:border-primary transition"
              placeholder="e.g. Apt 4B"
            />
          </div>

          {/* Place Order CTA */}
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-4 pb-4">
            <button
              type="submit"
              className="w-full bg-flame hover:bg-flame/90 text-white font-extrabold text-base py-3.5 rounded-full shadow-2xl transition active:scale-[0.98]"
            >
              Submit Order
            </button>
          </div>
        </form>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell gradient={false}>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-border/60">
        <div className="flex items-center gap-2 px-4 pt-5 pb-3">
          <Link to="/" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          {items.length > 0 && (
            <button
              onClick={() => {
                const next = !allSelected;
                setChecked(Object.fromEntries(items.map((c) => [c.id, next])));
              }}
              className="flex items-center gap-2 text-sm font-semibold"
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${allSelected ? "bg-black border-black" : "border-muted-foreground"}`}>
                {allSelected && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
              </span>
              All
            </button>
          )}
          <div className="flex items-center gap-1 ml-2 text-flame font-bold text-sm">
            <span className="italic">FF expires in</span>
            <span className="bg-flame text-white rounded px-1 py-0.5 text-xs font-mono">09</span>
            <span className="text-flame">:</span>
            <span className="bg-flame text-white rounded px-1 py-0.5 text-xs font-mono">25</span>
            <span className="text-flame">:</span>
            <span className="bg-flame text-white rounded px-1 py-0.5 text-xs font-mono">27</span>
          </div>
          <button className="ml-auto w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <div className="mx-4 mb-3 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
          <p className="text-xs font-semibold text-emerald-700">✓ Free shipping special for you</p>
          <span className="text-[10px] text-emerald-700/80 font-medium">Limited-time</span>
        </div>

        <div className="mx-4 mb-3 flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <p className="text-xs text-foreground/80">Deliver to <span className="font-semibold">Circle, Labbadi</span> · Accra, Ghana</p>
        </div>
      </header>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-24 px-8">
          <ShoppingCart className="w-16 h-16 text-muted-foreground/40" />
          <p className="text-base font-bold text-foreground/60">Your cart is empty</p>
          <p className="text-sm text-muted-foreground text-center">Tap "Add to Cart" on any product to get started</p>
          <Link
            to="/"
            className="mt-2 bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-full"
          >
            Shop now
          </Link>
        </div>
      )}

      {/* Items */}
      {items.length > 0 && (
        <div className="divide-y divide-border/60">
          {items.map((c, i) => {
            const isChecked = checked[c.id] !== false;
            const statusLabels = ["ONLY 10 LEFT", "ALMOST SOLD OUT", "BIG SALE", "LAST 2 DAYS", "BEST SELLER", "FLASH DEAL"];
            const status = statusLabels[i % statusLabels.length];
            return (
              <div key={c.id} className="flex gap-3 px-4 py-3">
                <button onClick={() => toggle(c.id)} className="pt-10">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${isChecked ? "bg-black border-black" : "border-muted-foreground"}`}>
                    {isChecked && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                  </span>
                </button>
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-secondary shrink-0">
                  <img src={c.image} alt={c.title} loading="lazy" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] font-bold px-1 py-0.5 text-center">
                    {status}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm line-clamp-2 leading-snug">{c.title}</p>
                    <button className="text-muted-foreground shrink-0" onClick={() => removeItem(c.id)}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{c.category} ⌄</p>
                  <p className="mt-1 text-[11px] font-extrabold text-flame flex items-center gap-1">
                    BIG SALE <Clock className="w-3 h-3" /> LAST 2 DAYS
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-extrabold text-flame">
                        ₵{c.price.toFixed(2)}
                      </span>
                      {c.original > c.price && (
                        <span className="text-[11px] text-muted-foreground line-through">₵{c.original.toFixed(2)}</span>
                      )}
                      {c.badge && (
                        <span className="text-[10px] bg-flame/10 text-flame border border-flame/30 rounded px-1 font-bold">
                          {c.badge}
                        </span>
                      )}
                    </div>
                    <select
                      value={c.qty}
                      onChange={(e) => updateQty(c.id, Number(e.target.value))}
                      className="text-xs border border-border rounded px-2 py-0.5 bg-white"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {items.length > 0 && (
        <div className="px-4 py-6 text-center text-xs text-muted-foreground">
          You have reached the bottom · {count} item{count !== 1 ? "s" : ""} in cart
        </div>
      )}

      {/* Sticky checkout bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
          <div className="mx-3 mb-3 rounded-full bg-black text-white flex items-center justify-between p-1.5 shadow-2xl">
            <div className="flex flex-col items-start pl-4 pr-2">
              <div className="flex items-baseline gap-1">
                {selectedTotal + savings > selectedTotal && (
                  <span className="text-[10px] line-through text-white/60">₵{(selectedTotal + savings).toFixed(2)}</span>
                )}
              </div>
              <div className="flex items-baseline gap-1 text-flame">
                <span className="text-xs">₵</span>
                <span className="text-lg font-extrabold leading-none">{selectedTotal.toFixed(2)}</span>
                <span className="text-[10px] text-flame/80">▲</span>
              </div>
            </div>
            {isLoggedIn ? (
              <button
                onClick={() => {
                  if (selected.length === 0) return;
                  setCheckoutStep("shipping");
                }}
                disabled={selected.length === 0}
                className="flex-1 mx-1 bg-flame hover:bg-flame/90 transition rounded-full py-2.5 text-center disabled:opacity-50"
              >
                <p className="text-sm font-extrabold">Checkout ({selected.length})</p>
                {savings > 0 && (
                  <p className="text-[10px] font-semibold text-white/90">Save ₵{savings.toFixed(2)}</p>
                )}
              </button>
            ) : (
              <Link
                to="/me"
                className="flex-1 mx-1 bg-primary rounded-full py-2.5 text-center flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <p className="text-sm font-extrabold">Sign in to checkout</p>
              </Link>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </PhoneShell>
  );
}
