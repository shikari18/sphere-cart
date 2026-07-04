import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchBotByCategory } from "@/lib/cj-api";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Visited by cron-job.org — imports ALL products from a full category at once
// URL: /bot-run?secret=mbshop_bot_2024&cat=Gaming
export const Route = createFileRoute("/bot-run")({
  component: BotRunPage,
});

function BotRunPage() {
  const [lines, setLines] = useState<string[]>(["Starting full category import..."]);
  const addLine = (line: string) => setLines(prev => [...prev, line]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const secret = params.get("secret");
    const cat = params.get("cat") || "Gaming";

    if (secret !== "mbshop_bot_2024") {
      setLines(["Unauthorized"]);
      return;
    }

    const run = async () => {
      addLine(`Starting full import of category: ${cat}`);
      let totalAdded = 0;

      // Get existing product IDs to avoid duplicates
      const existingSnap = await getDocs(collection(db, "bot_products"));
      const existingIds = new Set(existingSnap.docs.map(d => d.id));
      addLine(`Found ${existingIds.size} existing products`);

      // Fetch ALL 52 pages for this category
      for (let page = 1; page <= 52; page++) {
        try {
          const candidates = await fetchBotByCategory({ data: { category: cat, amount: 10, page } });
          const items = (candidates as any[]).filter(p => !existingIds.has(String(p.id)));

          if (items.length > 0) {
            await Promise.all(items.map(p => {
              existingIds.add(String(p.id));
              return setDoc(doc(db, "bot_products", String(p.id)), p);
            }));
            totalAdded += items.length;
            addLine(`Page ${page}: +${items.length} new products (total: ${totalAdded})`);
          } else {
            addLine(`Page ${page}: skipped (all duplicates)`);
          }

          // Small delay to avoid rate limiting
          await new Promise(r => setTimeout(r, 300));
        } catch (e: any) {
          addLine(`Page ${page} error: ${e.message}`);
        }
      }

      // Save state
      await setDoc(doc(db, "bot_status", `done_${cat}`), {
        cat, totalAdded, completedAt: new Date().toISOString()
      });

      addLine(`✅ DONE: Added ${totalAdded} products from ${cat}`);
    };

    run();
  }, []);

  return (
    <div style={{ fontFamily: "monospace", padding: 20, background: "#000", color: "#0f0", minHeight: "100vh" }}>
      {lines.map((line, i) => <div key={i}>{line}</div>)}
    </div>
  );
}
