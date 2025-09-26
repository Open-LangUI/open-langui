import { json } from "@sveltejs/kit";
import { g as getConnections, u as updateConnections } from "../../../../chunks/connections.js";
const GET = async () => {
  const settings = getConnections();
  return json({ connections: settings });
};
const PUT = async ({ request }) => {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON payload." }, { status: 400 });
  }
  const base_url = typeof payload.base_url === "string" ? payload.base_url.trim() : "";
  const api_key = typeof payload.api_key === "string" ? payload.api_key : "";
  const temperatureRaw = payload.temperature;
  const temperature = typeof temperatureRaw === "number" ? temperatureRaw : Number(temperatureRaw);
  if (!base_url) {
    return json({ error: "Base URL is required." }, { status: 400 });
  }
  if (!Number.isFinite(temperature)) {
    return json({ error: "Temperature must be a number." }, { status: 400 });
  }
  updateConnections({ base_url, api_key, temperature });
  return json({ success: true });
};
export {
  GET,
  PUT
};
