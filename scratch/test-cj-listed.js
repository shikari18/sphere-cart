const apiKey = "CJ5292255@api@b5fe6ac793314066801c38bc47fcab0c";

async function test() {
  console.log("Fetching access token...");
  try {
    const authRes = await fetch("https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey })
    });
    const authData = await authRes.json();
    const token = authData.data.accessToken;
    
    console.log("Fetching /product/listed/listedByPids...");
    const listRes = await fetch("https://developers.cjdropshipping.com/api2.0/v1/product/listed/listedByPids", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "CJ-Access-Token": token 
      },
      body: JSON.stringify({ pids: [] })
    });
    const listData = await listRes.json();
    console.log("/product/listed/listedByPids Response:", JSON.stringify(listData, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
