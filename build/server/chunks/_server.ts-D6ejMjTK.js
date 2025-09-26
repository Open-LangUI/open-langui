import { g as getConnections } from './connections-B7JSRTv3.js';
import './database-DPmGJg9n.js';
import 'node:sqlite';
import 'node:fs';
import 'node:path';

const HOP_BY_HOP_HEADERS = /* @__PURE__ */ new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade"
]);
async function forward(event) {
  const { path = "" } = event.params;
  const { base_url: rawBaseUrl, api_key: apiKey } = getConnections();
  if (!rawBaseUrl) {
    return new Response("Missing LM Studio base URL configuration", { status: 500 });
  }
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");
  const suffix = path ? `/${path}` : "";
  const targetUrl = `${baseUrl}${suffix}${event.url.search}`;
  const method = event.request.method.toUpperCase();
  const headers = new Headers();
  event.request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lower) || lower === "host" || lower === "content-length") {
      return;
    }
    headers.set(key, value);
  });
  if (apiKey && !headers.has("authorization")) {
    headers.set("authorization", `Bearer ${apiKey}`);
  }
  let body;
  if (method !== "GET" && method !== "HEAD") {
    const arrayBuffer = await event.request.arrayBuffer();
    body = arrayBuffer;
  }
  const init = {
    method,
    headers,
    body
  };
  try {
    const response = await fetch(targetUrl, init);
    const outgoingHeaders = new Headers();
    response.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (HOP_BY_HOP_HEADERS.has(lower)) {
        return;
      }
      outgoingHeaders.set(key, value);
    });
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: outgoingHeaders
    });
  } catch (error) {
    console.error("Proxy request failed", error);
    return new Response("Failed to reach LM Studio API", { status: 502 });
  }
}
const GET = async (event) => forward(event);
const POST = async (event) => forward(event);
const PUT = async (event) => forward(event);
const PATCH = async (event) => forward(event);
const DELETE = async (event) => forward(event);

export { DELETE, GET, PATCH, POST, PUT };
//# sourceMappingURL=_server.ts-D6ejMjTK.js.map
