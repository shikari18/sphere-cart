async function testHtml() {
  try {
    const res = await fetch("http://localhost:8080/");
    const html = await res.text();
    console.log("HTML length:", html.length);
    console.log("Has Satin Blouse:", html.includes("Satin Blouse"));
    console.log("Has 3 In 1 Magnetic:", html.includes("3 In 1 Magnetic"));
    console.log("Has YD03:", html.includes("YD03"));
    console.log("Has Curtains:", html.includes("Curtains"));
    
    // Let's print any script tag containing the loader data (look for __TSR_DEHYDRATED__ or similar serialised data)
    const match = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
    if (match) {
      console.log("Found", match.length, "script tags");
      for (const tag of match) {
        if (tag.includes("Satin Blouse") || tag.includes("products")) {
          console.log("Script containing products:", tag.slice(0, 500) + "...");
        }
      }
    }
  } catch (err) {
    console.error("Test failed:", err);
  }
}
testHtml();
