import { fetchCjProducts } from "../src/lib/cj-api.ts";

async function run() {
  try {
    const products = await fetchCjProducts({});
    console.log("Type of products:", typeof products);
    console.log("Is array:", Array.isArray(products));
    console.log("Products keys:", Object.keys(products || {}));
    console.log("Raw products:", products);
  } catch (err) {
    console.error("ERROR FETCHING PRODUCTS:", err);
  }
}

run();
