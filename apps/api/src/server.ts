import http from "node:http";
import { createDefaultCMSRepository } from "@portfolio/cms-repository";

const port = Number(process.env.PORT || 8787);
const repository = createDefaultCMSRepository({
  timeoutMs: Number(process.env.CMS_PROVIDER_TIMEOUT_MS || 3000),
});

function sendJson(response: http.ServerResponse, statusCode: number, body: unknown, cacheControl = "no-store, max-age=0") {
  response.writeHead(statusCode, {
    "access-control-allow-origin": process.env.CMS_API_ALLOW_ORIGIN || "*",
    "access-control-allow-methods": "GET,OPTIONS",
    "access-control-allow-headers": "content-type",
    "cache-control": cacheControl,
    "content-type": "application/json; charset=utf-8",
    "x-content-type-options": "nosniff",
  });
  response.end(JSON.stringify(body));
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/cms/public") {
    try {
      const result = await repository.loadPublicCMSData();
      sendJson(response, 200, result);
    } catch (error) {
      sendJson(response, 500, {
        error: error instanceof Error ? error.message : "CMS repository failed.",
      });
    }
    return;
  }

  if (request.method === "GET" && url.pathname === "/health") {
    sendJson(response, 200, { ok: true }, "public, max-age=30");
    return;
  }

  sendJson(response, 404, { error: "Not found" });
});

server.listen(port, () => {
  console.info(`[portfolio-api] listening on :${port}`);
});
