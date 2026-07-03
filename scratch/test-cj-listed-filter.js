const apiKey = "CJ5292255@api@b5fe6ac793314066801c38bc47fcab0c";

async function test() {
  const authRes = await fetch("https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey })
  });
  const authData = await authRes.json();
  const token = authData.data.accessToken;
    
  // Try querying with isList=1 or isConnect=1 param to get only the user's listed products
  const urls = [
    "https://developers.cjdropshipping.com/api2.0/v1/product/list?pageNum=1&pageSize=20&isList=1",
    "https://developers.cjdropshipping.com/api2.0/v1/product/list?pageNum=1&pageSize=20&listingStatus=1",
  ];
  
  for (const url of urls) {
    const res = await fetch(url, { headers: { "CJ-Access-Token": token } });
    const data = await res.json();
    console.log(`\nURL: ${url}`);
    console.log(`Total: ${data.data?.total}, Count: ${(data.data?.list || data.data?.content || []).length}`);
    if ((data.data?.list || data.data?.content || []).length > 0) {
      console.log("Products:", (data.data?.list || data.data?.content || []).map(p => `${p.productNameEn} [listed:${p.listedNum}]`));
    }
  }

  // Also try queryMine or listedProducts specific endpoints
  const myListedRes = await fetch("https://developers.cjdropshipping.com/api2.0/v1/product/list?pageNum=1&pageSize=20&isMyProduct=1", {
    headers: { "CJ-Access-Token": token }
  });
  const myListedData = await myListedRes.json();
  console.log("\nisMyProduct=1 Total:", myListedData.data?.total);
}

test();
