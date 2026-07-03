import { fetchCjProducts } from "../src/lib/cj-api.ts";

async function run() {
  try {
    const productsFn = await fetchCjProducts.handler({ data: {} });
    console.log("Calling __executeServer...");
    const products = await productsFn.__executeServer();
    console.log("SUCCESS! Products fetched:", products?.length);
    console.log(JSON.stringify(products, null, 2));
  } catch (err) {
    console.error("ERROR FETCHING PRODUCTS:", err);
  }
}

run();
