import earbuds from "@/assets/p-earbuds.jpg";
import bag from "@/assets/p-bag.jpg";
import watch from "@/assets/p-watch.jpg";
import sneakers from "@/assets/p-sneakers.jpg";
import slides from "@/assets/p-slides.jpg";
import tshirt from "@/assets/p-tshirt.jpg";
import necklace from "@/assets/p-necklace.jpg";
import charger from "@/assets/p-charger.jpg";
import makeup from "@/assets/p-makeup.jpg";
import speaker from "@/assets/p-speaker.jpg";
import sunglasses from "@/assets/p-sunglasses.jpg";
import hoodie from "@/assets/p-hoodie.jpg";
import controller from "@/assets/p-controller.jpg";
import lamp from "@/assets/p-lamp.jpg";
import serum from "@/assets/p-serum.jpg";
import runners from "@/assets/p-runners.jpg";

export type Product = {
  id: string;
  title: string;
  image: string;
  price: number;
  original: number;
  sold: string;
  rating: number;
  reviews: number;
  badge?: string;
  category: string;
  topRated?: boolean;
};

export const products: Product[] = [
  { id: "1", title: "Wireless Earbuds Pro — Noise Cancelling Bluetooth 5.3", image: earbuds, price: 18.99, original: 72, sold: "46K+ sold", rating: 4.8, reviews: 12340, badge: "-74%", category: "Electronics", topRated: true },
  { id: "2", title: "Premium Leather Crossbody Bag with Gold Chain", image: bag, price: 24.5, original: 89.99, sold: "22K+ sold", rating: 4.5, reviews: 658, badge: "-73%", category: "Bags" },
  { id: "3", title: "Smart Fitness Watch — Heart Rate & SpO2 Monitor", image: watch, price: 29.99, original: 94, sold: "150K+ sold", rating: 4.7, reviews: 8619, badge: "-68%", category: "Watches", topRated: true },
  { id: "4", title: "Classic White Leather Sneakers Unisex", image: sneakers, price: 34.9, original: 78, sold: "18K+ sold", rating: 4.6, reviews: 2103, badge: "-55%", category: "Shoes" },
  { id: "5", title: "Cloud-Like Soft EVA Comfortable Slide Sandals", image: slides, price: 12.84, original: 36.5, sold: "89K+ sold", rating: 4.7, reviews: 4210, badge: "-64%", category: "Shoes" },
  { id: "6", title: "Oversized Cotton Graphic T-Shirt — Streetwear Fit", image: tshirt, price: 9.99, original: 24.99, sold: "31K+ sold", rating: 4.5, reviews: 1820, badge: "-60%", category: "Fashion" },
  { id: "7", title: "Double Layer Silver Chain Necklace — Unisex Design", image: necklace, price: 6.39, original: 20.77, sold: "12K+ sold", rating: 4.4, reviews: 902, badge: "-69%", category: "Fashion" },
  { id: "8", title: "Fast Wireless Charging Pad 15W — Qi Certified", image: charger, price: 8.5, original: 29.99, sold: "58K+ sold", rating: 4.6, reviews: 3421, badge: "-71%", category: "Electronics" },
  { id: "9", title: "Professional Makeup Brush & Palette Set (16pcs)", image: makeup, price: 15.75, original: 49.99, sold: "24K+ sold", rating: 4.8, reviews: 5120, badge: "-68%", category: "Beauty", topRated: true },
  { id: "10", title: "Portable Bluetooth Speaker Waterproof IPX7", image: speaker, price: 19.9, original: 59.99, sold: "40K+ sold", rating: 4.6, reviews: 2988, badge: "-66%", category: "Electronics" },
  { id: "11", title: "Aviator Sunglasses Gold Frame UV400 Protection", image: sunglasses, price: 7.25, original: 22, sold: "16K+ sold", rating: 4.5, reviews: 1440, badge: "-67%", category: "Fashion" },
  { id: "12", title: "Heavyweight Cotton Fleece Hoodie — Unisex Oversized", image: hoodie, price: 21.99, original: 65, sold: "27K+ sold", rating: 4.7, reviews: 3009, badge: "-66%", category: "Fashion" },
  { id: "13", title: "Wireless Gaming Controller — PC/Console Compatible", image: controller, price: 22.4, original: 69.99, sold: "9K+ sold", rating: 4.5, reviews: 611, badge: "-68%", category: "Gaming" },
  { id: "14", title: "Minimalist Rechargeable Desk Lamp — Warm Light", image: lamp, price: 14.5, original: 39, sold: "11K+ sold", rating: 4.6, reviews: 812, badge: "-62%", category: "Home" },
  { id: "15", title: "Glow Vitamin C Face Serum 30ml — Brightening", image: serum, price: 11.2, original: 34, sold: "33K+ sold", rating: 4.8, reviews: 4720, badge: "-67%", category: "Beauty" },
  { id: "16", title: "Ultra Bounce Running Shoes — Breathable Mesh", image: runners, price: 27.9, original: 89, sold: "21K+ sold", rating: 4.6, reviews: 1990, badge: "-68%", category: "Shoes" },
];

export type CategoryDef = {
  slug: string;
  label: string;
  cover: string;
  tint: string;
};

export const categoryList: CategoryDef[] = [
  { slug: "Fashion", label: "Fashion", cover: tshirt, tint: "from-rose-100 to-rose-50" },
  { slug: "Electronics", label: "Electronics", cover: earbuds, tint: "from-sky-100 to-sky-50" },
  { slug: "Beauty", label: "Beauty", cover: makeup, tint: "from-pink-100 to-pink-50" },
  { slug: "Home", label: "Home", cover: lamp, tint: "from-emerald-100 to-emerald-50" },
  { slug: "Shoes", label: "Shoes", cover: sneakers, tint: "from-orange-100 to-orange-50" },
  { slug: "Bags", label: "Bags", cover: bag, tint: "from-amber-100 to-amber-50" },
  { slug: "Watches", label: "Watches", cover: watch, tint: "from-slate-200 to-slate-50" },
  { slug: "Gaming", label: "Gaming", cover: controller, tint: "from-indigo-100 to-indigo-50" },
];
