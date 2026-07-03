import { createServerFn } from "@tanstack/react-start";
import { productOverrides } from "@/data/product-overrides";

const apiKey = "CJ5292255@api@b5fe6ac793314066801c38bc47fcab0c";
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

// Internal server-side helper to authenticate and cache the token
async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }
  
  try {
    const response = await fetch("https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });
    
    const json = await response.json();
    if (json.code === 200 && json.data?.accessToken) {
      cachedToken = json.data.accessToken;
      // Cache token for 1 hour to prevent constant refetching
      tokenExpiry = now + 3600 * 1000;
      return cachedToken;
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

// Server function to fetch products from CJ Dropshipping
export const fetchCjProducts = createServerFn(
  "GET",
  async (payload: { category?: string; search?: string; page?: number; size?: number } = {}) => {
    const token = await getAccessToken();
    const pageNum = payload.page || 1;
    const pageSize = payload.size || 20;
    const keyWord = payload.search || payload.category || "";
    
    let url = `https://developers.cjdropshipping.com/api2.0/v1/product/listV2?pageNum=${pageNum}&pageSize=${pageSize}`;
    if (keyWord) {
      url += `&keyWord=${encodeURIComponent(keyWord)}`;
    }

    try {
      const response = await fetch(url, {
        headers: { "CJ-Access-Token": token },
      });
      const json = await response.json();
      
      if (json.code !== 200) {
        throw new Error(json.message || "Failed to fetch products from CJ API");
      }

      // Handle the nested structure: json.data[0].list
      const dataObj = json.data;
      const list = Array.isArray(dataObj) 
        ? (dataObj[0]?.list || []) 
        : (dataObj?.list || []);

      return list.map((item: any) => {
        // Check if there is a custom override for this product ID or SKU
        const override = productOverrides[item.id] || productOverrides[item.sku];

        // CJ prices are USD. Convert to GHC (₵) with a standard rate of 15
        const rate = 15.0;
        const priceUSD = parseFloat(item.sellPrice || "10.0");
        let priceGHC = priceUSD * rate;
        
        // Generate a random mockup discount (e.g. 55% to 78%)
        const discountRate = 0.5 + (Math.floor(item.id.slice(-2)) % 30) / 100;
        let originalGHC = priceGHC / (1 - discountRate);

        // Apply overrides if present
        let displayTitle = item.nameEn || item.name || "Dova Product";
        let displayImage = item.bigImage || item.mainImage || "";

        if (override) {
          if (override.title) displayTitle = override.title;
          if (override.image) displayImage = override.image;
          if (override.price !== undefined) priceGHC = override.price;
          if (override.originalPrice !== undefined) originalGHC = override.originalPrice;
        }

        const rating = 4.3 + (Math.floor(item.id.slice(-3)) % 7) / 10;
        const reviews = 50 + (Math.floor(item.id.slice(-4)) % 2500);
        
        const finalDiscount = Math.round(((originalGHC - priceGHC) / originalGHC) * 100);
        const badge = finalDiscount > 0 ? `-${finalDiscount}%` : "";

        return {
          id: item.id,
          title: displayTitle,
          image: displayImage,
          price: parseFloat(priceGHC.toFixed(2)),
          original: parseFloat(originalGHC.toFixed(2)),
          sold: reviews > 1000 ? `${(reviews * 1.5 / 1000).toFixed(0)}K+ sold` : `${reviews} sold`,
          rating: parseFloat(rating.toFixed(1)),
          reviews,
          badge,
          category: payload.category || "General",
          topRated: rating > 4.7,
          sku: item.sku,
        };
      });
    } catch (error) {
      console.error("CJ Fetch Products Error:", error);
      throw error;
    }
  }
);

// Server function to fetch product variants from CJ Dropshipping
export const fetchCjVariants = createServerFn(
  "GET",
  async (payload: { pid: string }) => {
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
          variantSellPrice: variantPriceGHC / 15.0, // Server function returns USD variantSellPrice, which is converted in ProductSheet
        };
      });
    } catch (error) {
      console.error("CJ Fetch Variants Error:", error);
      throw error;
    }
  }
);

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
export const createCjOrder = createServerFn(
  "POST",
  async (payload: CJOrderDetails) => {
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
  }
);
