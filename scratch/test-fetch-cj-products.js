import { fetchCjProducts } from "../src/lib/cj-api.ts";

async function run() {
  try {
    const products = await fetchCjProducts({});
    console.log("SUCCESS! Products fetched:", products.length);
    console.log(JSON.stringify(products, null, 2));
  } catch (err) {
    console.error("ERROR FETCHING PRODUCTS:", err);
  }
}

run();
