import { createServerFn } from "@tanstack/react-start";
import { productOverrides } from "@/data/product-overrides";

const apiKey = "CJ5292255@api@b5fe6ac793314066801c38bc47fcab0c";

// Local JSON database helpers — use dynamic imports to prevent bundling into browser
async function readLocalProducts(): Promise<any[]> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const dbPath = path.resolve(process.cwd(), "src/data/imported-products.json");
    const data = await fs.readFile(dbPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read local JSON database, returning empty array:", error);
    return [];
  }
}

async function writeLocalProducts(products: any[]) {
  const fs = await import("fs/promises");
  const path = await import("path");
  const dbPath = path.resolve(process.cwd(), "src/data/imported-products.json");
  await fs.writeFile(dbPath, JSON.stringify(products, null, 2), "utf-8");
}

// Internal server-side helper to authenticate — no caching so product changes reflect immediately
async function getAccessToken(): Promise<string> {
  try {
    const response = await fetch("https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });
    
    const json = await response.json();
    if (json.code === 200 && json.data?.accessToken) {
      return json.data.accessToken;
    }
    throw new Error(json.message || "Failed to authenticate with CJ Dropshipping API");
  } catch (error) {
    console.error("CJ Auth Error:", error);
    throw error;
  }
}

export type CJVariant = {
  vid: string;
  pid: string;
  variantNameEn: string;
  variantImage: string;
  variantSku: string;
  variantSellPrice: number;
};

// Helper to automatically categorize products based on their title keyword
function autoCategorize(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("charger") || t.includes("headset") || t.includes("earbud") || t.includes("phone") || t.includes("bluetooth") || t.includes("wireless") || t.includes("electronics") || t.includes("device") || t.includes("speaker")) {
    return "Electronics";
  }
  if (t.includes("dress") || t.includes("shirt") || t.includes("hoodie") || t.includes("t-shirt") || t.includes("jacket") || t.includes("clothing") || t.includes("fashion") || t.includes("necklace") || t.includes("sunglasses") || t.includes("ring")) {
    return "Fashion";
  }
  if (t.includes("makeup") || t.includes("brush") || t.includes("palette") || t.includes("beauty") || t.includes("serum") || t.includes("cosmetic") || t.includes("skincare")) {
    return "Beauty";
  }
  if (t.includes("lamp") || t.includes("light") || t.includes("vase") || t.includes("decor") || t.includes("home") || t.includes("desk") || t.includes("curtain")) {
    return "Home";
  }
  if (t.includes("shoes") || t.includes("sneakers") || t.includes("slides") || t.includes("sandals") || t.includes("runners")) {
    return "Shoes";
  }
  if (t.includes("bag") || t.includes("crossbody") || t.includes("backpack") || t.includes("leather")) {
    return "Bags";
  }
  if (t.includes("watch") || t.includes("smartwatch") || t.includes("fitness")) {
    return "Watches";
  }
  if (t.includes("gaming") || t.includes("controller") || t.includes("console") || t.includes("playstation") || t.includes("xbox") || t.includes("toy") || t.includes("dice")) {
    return "Gaming";
  }
  
  // Default fallback categories
  const categories = ["Electronics", "Fashion", "Beauty", "Home", "Shoes", "Bags", "Watches", "Gaming"];
  const charSum = title.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return categories[charSum % categories.length];
}

// Helper to normalise a CJ product item from any endpoint into the standard shape
function normalizeCjItem(item: any, payloadCategory?: string) {
  const id = item.productId || item.pid || item.id;
  const title = item.nameEn || item.productNameEn || item.name || "Dova Product";
  const image = item.bigImage || item.productImage || item.mainImage || "";
  const sku = item.sku || item.productSku || "";
  return { id, title, image, sku, rawItem: item, category: payloadCategory || autoCategorize(title) };
}

// ── Firestore helpers (server-side only) ─────────────────────────────────────

async function getFirestoreAdmin() {
  // Use Firebase client SDK on server via dynamic import
  const { initializeApp, getApps } = await import("firebase/app");
  const { getFirestore, collection, getDocs, doc, setDoc, getDoc } = await import("firebase/firestore");

  const firebaseConfig = {
    apiKey: "AIzaSyBoUraz3l9P2VG8r4XvcE-zkylRqJDXoV0",
    authDomain: "chat-ec8b1.firebaseapp.com",
    projectId: "chat-ec8b1",
    storageBucket: "chat-ec8b1.firebasestorage.app",
    messagingSenderId: "841415038703",
    appId: "1:841415038703:web:e449b9ba7b40bd41972d1a",
  };

  const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  const db = getFirestore(app);
  return { db, collection, getDocs, doc, setDoc, getDoc };
}

async function getRemovedProductIds(): Promise<Set<string>> {
  try {
    const { db, doc, getDoc } = await getFirestoreAdmin();
    const snap = await getDoc(doc(db, "removed_products", "list"));
    if (!snap.exists()) return new Set();
    const data = snap.data();
    return new Set<string>((data.ids as string[]) || []);
  } catch {
    return new Set();
  }
}

async function getPriceOverrides(): Promise<Record<string, number>> {
  try {
    const { db, collection, getDocs } = await getFirestoreAdmin();
    const snap = await getDocs(collection(db, "product_overrides"));
    const overrides: Record<string, number> = {};
    snap.forEach((d) => {
      const data = d.data();
      if (data.price !== undefined) overrides[d.id] = data.price;
    });
    return overrides;
  } catch {
    return {};
  }
}

async function getBotProductsList(): Promise<any[]> {
  try {
    const { db, collection, getDocs } = await getFirestoreAdmin();
    const snap = await getDocs(collection(db, "bot_products"));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
  } catch {
    return [];
  }
}

// Server function to fetch products from CJ Dropshipping
// Fetches live from CJ My Products — any product added/removed on CJ reflects immediately
export const fetchCjProducts = createServerFn({ method: "GET" })
  .handler(async ({ data }: { data?: { category?: string; search?: string; page?: number; size?: number; bypassLocal?: boolean } }) => {
    const payload = data || {};
    const token = await getAccessToken();
    const pageNum = payload.page || 1;
    const pageSize = payload.size || 24;
    const keyWord = (payload.search || payload.category || "").toLowerCase();

    // Load Firestore data in parallel
    const [removedIds, firestorePriceOverrides, botProducts] = await Promise.all([
      getRemovedProductIds(),
      getPriceOverrides(),
      getBotProductsList(),
    ]);

    try {
      console.log("[fetchCjProducts] payload:", payload);

      // Fetch live from CJ My Products
      const myProdRes = await fetch(
        `https://developers.cjdropshipping.com/api2.0/v1/product/myProduct/query?pageNum=1&pageSize=200`,
        { headers: { "CJ-Access-Token": token } }
      );
      const myProdJson = await myProdRes.json();
      console.log("[fetchCjProducts] My Products response code:", myProdJson.code, "count:", myProdJson.data?.content?.length || 0);

      let rawList: any[] = [];
      if (myProdJson.code === 200 && myProdJson.data?.content?.length > 0) {
        rawList = myProdJson.data.content;
      }

      // Filter by keyword/category if provided
      if (keyWord && rawList.length > 0) {
        rawList = rawList.filter((item: any) => {
          const norm = normalizeCjItem(item);
          const matchesKeyword = norm.title.toLowerCase().includes(keyWord) || norm.sku.toLowerCase().includes(keyWord);
          const matchesCategory = !payload.category || norm.category.toLowerCase() === payload.category.toLowerCase();
          return matchesKeyword && matchesCategory;
        });
      }

      // Helper to shape a raw item into the final product format
      const shapeProduct = (item: any, isBot = false) => {
        const norm = normalizeCjItem(item, isBot ? (item.category || undefined) : payload.category);
        const id = String(norm.id);
        const { title: normTitle, image: normImage, sku: normSku, category: normCat } = norm;

        // Check static overrides (from product-overrides.ts)
        const staticOverride = productOverrides[id] || productOverrides[normSku];

        // Handle price ranges like "25.89-62.65" — take lowest price
        const rawSellPrice = isBot ? item.price : (item.sellPrice || "10.0");
        const priceUSDStr = rawSellPrice.toString().split("-")[0].trim();
        const priceUSD = parseFloat(priceUSDStr);

        const rate = 15.0;
        const markup = 1.4;
        const costGHC = isNaN(priceUSD) ? 15 : priceUSD * rate;
        let priceGHC = isBot
          ? parseFloat(String(item.price || costGHC * 1.15))
          : parseFloat((costGHC * markup).toFixed(2));
        let originalGHC = isBot
          ? parseFloat(String(item.original || priceGHC * 2))
          : parseFloat((priceGHC * 2).toFixed(2));

        let displayTitle = isBot ? (item.title || normTitle) : normTitle;
        let displayImage = isBot ? (item.image || normImage) : normImage;

        if (staticOverride) {
          if (staticOverride.title) displayTitle = staticOverride.title;
          if (staticOverride.image) displayImage = staticOverride.image;
          if (staticOverride.price !== undefined) priceGHC = staticOverride.price;
          if (staticOverride.originalPrice !== undefined) originalGHC = staticOverride.originalPrice;
        }

        // Apply Firestore price overrides (admin-set prices take highest precedence)
        if (firestorePriceOverrides[id] !== undefined) {
          priceGHC = firestorePriceOverrides[id];
        }

        const rating = 4.3 + (parseInt(id.slice(-3), 10) % 7) / 10;
        const reviews = 50 + (parseInt(id.slice(-4), 10) % 2500);
        const finalDiscount = Math.round(((originalGHC - priceGHC) / originalGHC) * 100);
        const discountSteps = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70];
        const discountIdx = parseInt(id.slice(-2), 16) % discountSteps.length;
        const badge = `-${discountSteps[discountIdx]}%`;

        return {
          id,
          title: displayTitle,
          image: displayImage,
          price: parseFloat(priceGHC.toFixed(2)),
          original: parseFloat(originalGHC.toFixed(2)),
          sold: reviews > 1000 ? `${(reviews * 1.5 / 1000).toFixed(0)}K+ sold` : `${reviews} sold`,
          rating: parseFloat(rating.toFixed(1)),
          reviews,
          badge,
          category: isBot ? (item.category || normCat) : normCat,
          topRated: rating > 4.7,
          sku: isBot ? (item.sku || normSku) : normSku,
        };
      };

      // Filter removed products
      rawList = rawList.filter((item: any) => {
        const id = String(item.productId || item.pid || item.id);
        return !removedIds.has(id);
      });

      // Paginate My Products
      const start = (pageNum - 1) * pageSize;
      const paginatedRaw = rawList.slice(start, start + pageSize);
      console.log("[fetchCjProducts] Final count:", paginatedRaw.length);

      const myProducts = paginatedRaw.map((item) => shapeProduct(item, false));

      // Merge bot products (filter removed, apply keyword filter)
      const filteredBotProducts = botProducts
        .filter((bp) => !removedIds.has(String(bp.id)))
        .filter((bp) => {
          if (!keyWord) return true;
          const t = (bp.title || "").toLowerCase();
          const matchesKeyword = t.includes(keyWord);
          const matchesCategory = !payload.category || (bp.category || "").toLowerCase() === payload.category.toLowerCase();
          return matchesKeyword && matchesCategory;
        })
        .map((bp) => shapeProduct(bp, true));

      return [...myProducts, ...filteredBotProducts];
    } catch (error) {
      console.error("CJ Fetch Products Error:", error);
      throw error;
    }
  }
);

// Server function to fetch only imported products
export const fetchImportedProducts = createServerFn({ method: "GET" })
  .handler(async () => {
    return await readLocalProducts();
  });

// Server function to import product into local JSON database
export const importCjProduct = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: { product: any } }) => {
    const payload = data;
    const localProds = await readLocalProducts();
    if (!localProds.some((p: any) => p.id === payload.product.id)) {
      localProds.push(payload.product);
      await writeLocalProducts(localProds);
    }
    return { success: true };
  });

// Server function to remove product from local JSON database
export const removeImportedProduct = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: { pid: string } }) => {
    const payload = data;
    let localProds = await readLocalProducts();
    localProds = localProds.filter((p: any) => p.id !== payload.pid);
    await writeLocalProducts(localProds);
    return { success: true };
  });

// Server function to fetch product variants from CJ Dropshipping
export const fetchCjVariants = createServerFn({ method: "GET" })
  .handler(async ({ data }: { data: { pid: string } }) => {
    const payload = data;
    const token = await getAccessToken();
    try {
      const response = await fetch(`https://developers.cjdropshipping.com/api2.0/v1/product/variant/query?pid=${payload.pid}`, {
        headers: { "CJ-Access-Token": token },
      });
      const json = await response.json();
      
      if (json.code !== 200) {
        throw new Error(json.message || "Failed to fetch product variants from CJ API");
      }

      const variants = json.data || [];
      return variants.map((v: any) => {
        const override = productOverrides[v.vid] || productOverrides[v.variantSku] || productOverrides[v.pid];

        let variantName = v.variantNameEn || v.variantKey || "Default Variant";
        let variantImage = v.variantImage || v.image || "";
        let variantPriceUSD = parseFloat((v.variantSellPrice || v.price || 0).toString());
        let variantPriceGHC = variantPriceUSD * 15.0;

        if (override) {
          if (override.title && (variantName === "Default Variant" || !variantName)) {
            variantName = override.title;
          }
          const specificVarOverride = productOverrides[v.vid] || productOverrides[v.variantSku];
          if (specificVarOverride?.image) {
            variantImage = specificVarOverride.image;
          }
          if (specificVarOverride?.price !== undefined) {
            variantPriceGHC = specificVarOverride.price;
          }
        }

        return {
          vid: v.vid,
          pid: v.pid,
          variantNameEn: variantName,
          variantImage: variantImage,
          variantSku: v.variantSku || v.sku || "",
          variantSellPrice: variantPriceGHC,
        };
      });
    } catch (error) {
      console.error("CJ Fetch Variants Error:", error);
      throw error;
    }
  });

export type CJOrderDetails = {
  customerName: string;
  countryCode: string;
  province: string;
  city: string;
  address: string;
  address2?: string;
  zip: string;
  phone: string;
  email: string;
  products: {
    vid: string;
    quantity: number;
  }[];
};

// Server function to create order in CJ Dropshipping
export const createCjOrder = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: CJOrderDetails }) => {
    const payload = data;
    const token = await getAccessToken();
    
    const orderNumber = `DOVA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const requestBody = {
      orderNumber,
      shippingCustomerName: payload.customerName,
      shippingCountryCode: payload.countryCode,
      shippingProvince: payload.province,
      shippingCity: payload.city,
      shippingAddress: payload.address,
      shippingAddress2: payload.address2 || "",
      shippingZip: payload.zip,
      shippingPhone: payload.phone,
      email: payload.email,
      payType: 3,
      products: payload.products.map((p, index) => ({
        vid: p.vid,
        quantity: p.quantity,
        storeLineItemId: `item-${index}-${Date.now()}`
      }))
    };

    try {
      const response = await fetch("https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrderV3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CJ-Access-Token": token,
        },
        body: JSON.stringify(requestBody),
      });

      const json = await response.json();
      if (json.code !== 200) {
        throw new Error(json.message || "Failed to create order on CJ Dropshipping");
      }

      return {
        success: true,
        orderId: json.data?.orderId || orderNumber,
        message: "Order placed successfully on CJ Dropshipping",
        cjData: json.data
      };
    } catch (error) {
      console.error("CJ Create Order Error:", error);
      throw error;
    }
  });

// ── Admin: Firestore write helpers ───────────────────────────────────────────

/** Remove a product — saves its ID to Firestore removed_products/list */
export const adminRemoveProduct = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: { productId: string } }) => {
    const { db, doc, getDoc, setDoc } = await getFirestoreAdmin();
    const ref = doc(db, "removed_products", "list");
    const snap = await getDoc(ref);
    const existing: string[] = snap.exists() ? (snap.data().ids || []) : [];
    if (!existing.includes(data.productId)) {
      await setDoc(ref, { ids: [...existing, data.productId] }, { merge: true });
    }
    return { success: true };
  });

/** Set a price override for a product in Firestore */
export const adminSetProductPrice = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: { productId: string; price: number } }) => {
    const { db, doc, setDoc } = await getFirestoreAdmin();
    await setDoc(doc(db, "product_overrides", data.productId), { price: data.price }, { merge: true });
    return { success: true };
  });

/** Remove a user document from Firestore (soft delete — marks as removed) */
export const adminRemoveUser = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: { uid: string } }) => {
    const { db, doc, setDoc } = await getFirestoreAdmin();
    await setDoc(doc(db, "users", data.uid), { removed: true, removedAt: new Date().toISOString() }, { merge: true });
    return { success: true };
  });

/** Fetch all users from Firestore */
export const adminGetUsers = createServerFn({ method: "GET" })
  .handler(async () => {
    const { db, collection, getDocs } = await getFirestoreAdmin();
    const snap = await getDocs(collection(db, "users"));
    return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
  });

/** Fetch stats: user count, order count */
export const adminGetStats = createServerFn({ method: "GET" })
  .handler(async () => {
    const { db, collection, getDocs } = await getFirestoreAdmin();
    const [usersSnap, ordersSnap, botSnap] = await Promise.all([
      getDocs(collection(db, "users")),
      getDocs(collection(db, "orders")),
      getDocs(collection(db, "bot_products")),
    ]);
    return {
      totalUsers: usersSnap.size,
      totalOrders: ordersSnap.size,
      totalBotProducts: botSnap.size,
    };
  });

/** Get bot status from Firestore */
export const adminGetBotStatus = createServerFn({ method: "GET" })
  .handler(async () => {
    const { db, doc, getDoc } = await getFirestoreAdmin();
    const snap = await getDoc(doc(db, "bot_status", "latest"));
    if (!snap.exists()) return { lastRun: null, addedToday: 0 };
    return snap.data() as { lastRun: string; addedToday: number };
  });

/** Get all products from Firestore bot_products collection */
export const getBotProducts = createServerFn({ method: "GET" })
  .handler(async () => {
    return await getBotProductsList();
  });

/** Get all CJ My Products (for admin panel listing) */
export const adminGetCjProducts = createServerFn({ method: "GET" })
  .handler(async () => {
    const token = await getAccessToken();
    const [removedIds, firestorePriceOverrides] = await Promise.all([
      getRemovedProductIds(),
      getPriceOverrides(),
    ]);

    const myProdRes = await fetch(
      `https://developers.cjdropshipping.com/api2.0/v1/product/myProduct/query?pageNum=1&pageSize=200`,
      { headers: { "CJ-Access-Token": token } }
    );
    const myProdJson = await myProdRes.json();
    const rawList: any[] = myProdJson.code === 200 ? (myProdJson.data?.content || []) : [];

    return rawList.map((item: any) => {
      const norm = normalizeCjItem(item);
      const id = String(norm.id);
      const rawSellPrice = item.sellPrice || "10.0";
      const priceUSDStr = rawSellPrice.toString().split("-")[0].trim();
      const priceUSD = parseFloat(priceUSDStr);
      const rate = 15.0;
      const markup = 1.4;
      const costGHC = isNaN(priceUSD) ? 15 : priceUSD * rate;
      const basePrice = parseFloat((costGHC * markup).toFixed(2));
      const currentPrice = firestorePriceOverrides[id] !== undefined ? firestorePriceOverrides[id] : basePrice;

      return {
        id,
        title: norm.title,
        image: norm.image,
        sku: norm.sku,
        category: norm.category,
        basePrice,
        currentPrice,
        removed: removedIds.has(id),
      };
    });
  });

// ── Auto-Bot: fetches products from CJ catalog and saves to Firestore ────────

export const runCjAutoBot = createServerFn({ method: "POST" })
  .handler(async () => {
    const token = await getAccessToken();

    // Fetch 70 products from the CJ general catalog (listV2 endpoint)
    const catalogRes = await fetch(
      `https://developers.cjdropshipping.com/api2.0/v1/product/listV2?pageNum=1&pageSize=70`,
      { headers: { "CJ-Access-Token": token } }
    );
    const catalogJson = await catalogRes.json();

    if (catalogJson.code !== 200) {
      throw new Error(catalogJson.message || "Failed to fetch CJ catalog products");
    }

    const items: any[] = catalogJson.data?.list || catalogJson.data?.content || [];

    const { db, doc, setDoc, collection, getDocs } = await getFirestoreAdmin();

    // Get existing bot product IDs to avoid duplicates
    const existingSnap = await getDocs(collection(db, "bot_products"));
    const existingIds = new Set(existingSnap.docs.map((d) => d.id));

    let added = 0;
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    for (const item of items) {
      const norm = normalizeCjItem(item);
      const id = String(norm.id);
      if (!id || existingIds.has(id)) continue;

      // Parse sell price, convert USD → GHC (×15), add 15% markup
      const rawSellPrice = item.sellPrice || item.price || "10.0";
      const priceUSDStr = rawSellPrice.toString().split("-")[0].trim();
      const priceUSD = parseFloat(priceUSDStr);
      const costGHC = isNaN(priceUSD) ? 15 : priceUSD * 15;
      const priceGHC = parseFloat((costGHC * 1.15).toFixed(2));
      const originalGHC = parseFloat((priceGHC * 2).toFixed(2));

      await setDoc(doc(db, "bot_products", id), {
        id,
        title: norm.title,
        image: norm.image,
        price: priceGHC,
        original: originalGHC,
        category: norm.category,
        sku: norm.sku,
        addedAt: now.toISOString(),
        addedDate: todayStr,
      });

      added++;
    }

    // Update bot status
    await setDoc(doc(db, "bot_status", "latest"), {
      lastRun: now.toISOString(),
      addedToday: added,
    });

    return { added, timestamp: now.toISOString() };
  });
