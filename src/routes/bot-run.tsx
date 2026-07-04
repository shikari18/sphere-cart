import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchBotByCategory, saveBotProducts } from "@/lib/cj-api";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

// This route runs the bot automatically when visited
// Cron-job.org visits: https://shopping-9ln6.onrender.com/bot-run?secret=mbshop_bot_2024&cat=Gaming&page=1
export const Route = createFileRoute("/bot-run")({
  component: BotRunPage,
});

const CATS = ["Gaming", "Fashion", "Electronics", "Beauty", "Shoes", "Bags", "Watches", "Home"];

function BotRunPage() {
  const [result, setResult] = useState("Running...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const secret = params.get("secret");
    const cat = params.get("cat") || "Gaming";
    const page = parseInt(params.get("page") || "1", 10);

    if (secret !== "mbshop_bot_2024") {
      setResult("Unauthorized");
      return;
    }

    const run = async () => {
      try {
        const candidates = await fetchBotByCategory({ data: { category: cat, amount: 10, page } });
        const items = candidates as any[];
        if (items.length > 0) {
          await Promise.all(items.map(p => setDoc(doc(db, "bot_products", String(p.id)), p)));
          setResult(`OK: added ${items.length} products from ${cat} page ${page}`);
        } else {
          setResult(`OK: no new products on ${cat} page ${page}`);
        }
      } catch (e: any) {
        setResult(`Error: ${e.message}`);
      }
    };

    run();
  }, []);

  return (
    <div style={{ fontFamily: "monospace", padding: 20 }}>
      <pre>{result}</pre>
    </div>
  );
}
