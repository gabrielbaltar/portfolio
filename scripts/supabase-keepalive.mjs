const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY.");
  process.exit(1);
}

const endpoint = new URL("/rest/v1/site_settings", SUPABASE_URL);
endpoint.searchParams.set("select", "id");
endpoint.searchParams.set("limit", "1");

const response = await fetch(endpoint, {
  headers: {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    Accept: "application/json",
    Prefer: "count=none",
  },
});

if (!response.ok) {
  const body = (await response.text()).slice(0, 500);
  console.error(`Supabase keepalive failed: ${response.status} ${response.statusText}`);
  if (body) {
    console.error(body);
  }
  process.exit(1);
}

console.log(`Supabase keepalive OK (${response.status}) -> ${endpoint.origin}`);
