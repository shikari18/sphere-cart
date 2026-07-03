import { fetchCjProducts } from "../src/lib/cj-api.ts";

async function run() {
  try {
    const products = await fetchCjProducts.handler({ data: {} });
    console.log("Type of products:", typeof products);
    console.log("Is array:", Array.isArray(products));
    console.log("Keys:", Object.keys(products || {}));
    console.log("Raw value:", products);
  } catch (err) {
    console.error("ERROR FETCHING PRODUCTS:", err);
  }
}

run();
