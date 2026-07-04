import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getFirestoreAdmin } from "@/lib/cj-api-admin";

// This endpoint is called by Render Cron every 5 minutes
// It fetches 10 products per category and saves them to Firestore
export const Route = createAPIFileRoute("/api/bot-cron")({
  GET: async ({ request }) => {
    // Simple secret check to prevent unauthorized calls
    const url = new URL(request.url);
    const secret = url.searchParams.get("secret");
    if (secret !== "mbshop_bot_2024") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    try {
      const apiKeys = [
        "CJ5292255@api@b5fe6ac793314066801c38bc47fcab0c",
      ];

      // Get access token
      let token = "";
      for (const key of apiKeys) {
        const authRes = await fetch("https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey: key }),
        });
        const authJson = await authRes.json();
        if (authJson.code === 200 && authJson.data?.accessToken) {
          token = authJson.data.accessToken;
          break;
        }
      }

      if (!token) return new Response(JSON.stringify({ error: "Auth failed" }), { status: 500 });

      const { db, doc, setDoc, collection, getDocs } = await getFirestoreAdmin();

      // Get existing IDs to skip duplicates
      const existingSnap = await getDocs(collection(db, "bot_products"));
      const existingIds = new Set(existingSnap.docs.map((d: any) => d.id));

      // Get bot state (which category/page we're on)
      const stateRef = doc(db, "bot_status", "cron_state");
      const stateSnap = await (await import("firebase/firestore")).getDoc(stateRef);
      const state = stateSnap.exists() ? stateSnap.data() : { catIndex: 0, pageNum: 1 };

      const categories = ["Gaming", "Fashion", "Electronics", "Beauty", "Shoes", "Bags", "Watches", "Home"];
      const cat = categories[state.catIndex % categories.length];
      let pageNum = state.pageNum || 1;

      // Fetch 10 products from current category/page
      const res = await fetch(
        `https://developers.cjdropshipping.com/api2.0/v1/product/listV2?pageNum=${pageNum}&pageSize=10&keyWord=${encodeURIComponent(cat)}`,
        { headers: { "CJ-Access-Token": token } }
      );
      const json = await res.json();

      let added = 0;
      const now = new Date();

      if (json.code === 200 && json.data?.content?.length > 0) {
        const items = json.data.content[0]?.productList || [];

        for (const item of items) {
          const id = String(item.id || item.pid || "");
          if (!id || existingIds.has(id)) continue;

          const title = item.nameEn || item.productNameEn || "Product";
          const image = item.bigImage || item.productImage || "";
          const sku = item.sku || item.productSku || "";

          const rawSellPrice = (item.sellPrice || item.nowPrice || "10.0").toString().split(" ")[0].split("-")[0].trim();
          const priceUSD = parseFloat(rawSellPrice) || 10;
          const costGHC = priceUSD * 15;
          const priceGHC = parseFloat((costGHC * 1.15).toFixed(2));
          const originalGHC = parseFloat((priceGHC * 2).toFixed(2));

          const discountSteps = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70];
          const badge = `-${discountSteps[Math.abs(id.charCodeAt(0) || 0) % discountSteps.length]}%`;

          // Auto-categorize
          const t = title.toLowerCase();
          let category = cat;
          if (t.includes("gaming") || t.includes("controller") || t.includes("console")) category = "Gaming";
          else if (t.includes("dress") || t.includes("shirt") || t.includes("fashion")) category = "Fashion";
          else if (t.includes("phone") || t.includes("wireless") || t.includes("bluetooth")) category = "Electronics";
          else if (t.includes("beauty") || t.includes("makeup") || t.includes("serum")) category = "Beauty";
          else if (t.includes("shoe") || t.includes("sneaker") || t.includes("slides")) category = "Shoes";
          else if (t.includes("bag") || t.includes("backpack")) category = "Bags";
          else if (t.includes("watch")) category = "Watches";
          else if (t.includes("lamp") || t.includes("home") || t.includes("desk")) category = "Home";

          await setDoc(doc(db, "bot_products", id), {
            id, title, image, price: priceGHC, original: originalGHC,
            category, sku, badge,
            addedAt: now.toISOString(),
            addedDate: now.toISOString().slice(0, 10),
          });
          added++;
        }
      }

      // Advance to next page/category
      let nextPage = pageNum + 1;
      let nextCatIndex = state.catIndex;
      if (nextPage > 52) { nextPage = 1; nextCatIndex++; }

      await setDoc(stateRef, {
        catIndex: nextCatIndex % categories.length,
        pageNum: nextPage,
        lastRun: now.toISOString(),
        addedThisRun: added,
      });

      return new Response(JSON.stringify({
        success: true,
        added,
        category: cat,
        page: pageNum,
        nextCategory: categories[nextCatIndex % categories.length],
      }), { headers: { "Content-Type": "application/json" } });

    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  },
});
