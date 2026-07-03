const apiKey = "CJ5292255@api@b5fe6ac793314066801c38bc47fcab0c";

async function test() {
  const authRes = await fetch("https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey })
  });
  const authData = await authRes.json();
  const token = authData.data.accessToken;
    
  // Get ALL products in user's personal CJ list (includes listed, on listing etc)
  const res = await fetch("https://developers.cjdropshipping.com/api2.0/v1/product/list?pageNum=1&pageSize=20", {
    headers: { "CJ-Access-Token": token }
  });
  const data = await res.json();
  console.log("Total records:", data.data?.total);
  console.log("Fields of first product:", JSON.stringify(data.data?.list?.[0] || data.data?.content?.[0], null, 2));
  console.log("All product names:", (data.data?.list || data.data?.content || []).map(p => `${p.productNameEn || p.nameEn} [${p.pid || p.id}] saleStatus:${p.saleStatus}`));
}

test();
