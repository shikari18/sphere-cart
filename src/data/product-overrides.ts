export type ProductOverride = {
  /**
   * Override the default CJ product title/name
   */
  title?: string;
  /**
   * Override the product image. Can be a local path in the public folder (e.g. "/my-image.png")
   * or a full external URL (e.g. "https://example.com/image.jpg")
   */
  image?: string;
  /**
   * Override the price in GHC (₵). If set, this price will be used instead of the converted CJ price.
   */
  price?: number;
  /**
   * Override the original (before-discount) comparison price in GHC (₵)
   */
  originalPrice?: number;
};

/**
 * Map your custom product presentation details here.
 * The key can be either the CJ Product ID (e.g. "1387970129463218176")
 * or the CJ SKU (e.g. "CJLY1107113").
 * 
 * Place your custom images in the "public/" directory (e.g., "public/custom-dress.png")
 * and reference them here as "/custom-dress.png".
 */
export const productOverrides: Record<string, ProductOverride> = {
  // Example using a SKU (Sexy Halter Strap Dress)
  "CJLY1107113": {
    title: "Premium Halter Strap Silk Dress",
    image: "/logo.png", // Replace with your image path (e.g., "/dress.png")
    price: 150.00,
    originalPrice: 450.00
  },
  
  // Example using a Product ID (Fashionable Indoor Vase Lamp)
  "1394478437376331776": {
    title: "Minimalist Ceramic Vase Ambient Light",
    image: "/logo.png", // Replace with your image path (e.g., "/vase-lamp.png")
    price: 99.00,
    originalPrice: 299.00
  }
};
