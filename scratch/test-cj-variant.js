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
    console.log("Fetching variants for product 1387970129463218176...");
    const varRes = await fetch("https://developers.cjdropshipping.com/api2.0/v1/product/variant/query?pid=1387970129463218176", {
      headers: { "CJ-Access-Token": token }
    });
    const varData = await varRes.json();
    console.log("Variants Response:", JSON.stringify(varData, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
