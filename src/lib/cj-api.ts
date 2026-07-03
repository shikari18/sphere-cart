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
  // myProduct/query uses: productId, nameEn, bigImage, sku
  // product/list uses: pid, productNameEn, productImage, productSku
  const id = item.productId || item.pid || item.id;
  const title = item.nameEn || item.productNameEn || item.name || "Dova Product";
  const image = item.bigImage || item.productImage || item.mainImage || "";
  const sku = item.sku || item.productSku || "";
  return { id, title, image, sku, rawItem: item, category: payloadCategory || autoCategorize(title) };
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

      // Paginate
      const start = (pageNum - 1) * pageSize;
      rawList = rawList.slice(start, start + pageSize);
      console.log("[fetchCjProducts] Final count:", rawList.length);

      return rawList.map((item: any) => {
        const norm = normalizeCjItem(item, payload.category);
        // Ensure id is always a string so .slice() never throws
        const id = String(norm.id);
        const { title: normTitle, image: normImage, sku: normSku, category: normCat } = norm;

        // Check overrides
        const override = productOverrides[id] || productOverrides[normSku];

        // Handle price ranges like "25.89-62.65" — take lowest price
        const rawSellPrice = item.sellPrice || "10.0";
        const priceUSDStr = rawSellPrice.toString().split("-")[0].trim();
        const priceUSD = parseFloat(priceUSDStr);

        const rate = 15.0;        // USD → GHC conversion
        const markup = 1.4;       // 40% profit margin above cost
        const costGHC = isNaN(priceUSD) ? 15 : priceUSD * rate;
        let priceGHC = parseFloat((costGHC * markup).toFixed(2));   // your selling price
        let originalGHC = parseFloat((priceGHC * 2).toFixed(2));    // show as 50% off deal

        let displayTitle = normTitle;
        let displayImage = normImage;

        if (override) {
          if (override.title) displayTitle = override.title;
          if (override.image) displayImage = override.image;
          if (override.price !== undefined) priceGHC = override.price;
          if (override.originalPrice !== undefined) originalGHC = override.originalPrice;
        }

        const rating = 4.3 + (parseInt(id.slice(-3), 10) % 7) / 10;
        const reviews = 50 + (parseInt(id.slice(-4), 10) % 2500);
        const finalDiscount = Math.round(((originalGHC - priceGHC) / originalGHC) * 100);
        const badge = finalDiscount > 0 ? `-${finalDiscount}%` : "";

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
          category: normCat,
          topRated: rating > 4.7,
          sku: normSku,
        };
      });
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
        // Check for variant level or product level overrides
        const override = productOverrides[v.vid] || productOverrides[v.variantSku] || productOverrides[v.pid];

        let variantName = v.variantNameEn || v.variantKey || "Default Variant";
        let variantImage = v.variantImage || v.image || "";
        let variantPriceUSD = parseFloat((v.variantSellPrice || v.price || 0).toString());
        let variantPriceGHC = variantPriceUSD * 15.0;

        if (override) {
          // If product level override has a custom title but variant name is generic, we can merge
          if (override.title && (variantName === "Default Variant" || !variantName)) {
            variantName = override.title;
          }
          // We can override variant image if a specific variant override exists
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
          variantSellPrice: variantPriceGHC, // already in GHC
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
    
    // Generate a unique order number for CJ
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
      payType: 3, // Create order only (unpaid status in CJ)
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
