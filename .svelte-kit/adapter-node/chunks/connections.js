import { d as db } from "./database.js";
function getConnections() {
  const row = db.prepare("SELECT base_url, api_key, temperature FROM connections WHERE id = 1").get();
  if (!row) {
    return {
      base_url: "http://localhost:1234",
      api_key: "",
      temperature: 0.2
    };
  }
  return {
    base_url: row.base_url,
    api_key: row.api_key ?? "",
    temperature: typeof row.temperature === "number" ? row.temperature : Number(row.temperature) || 0.2
  };
}
function updateConnections(settings) {
  const stmt = db.prepare(
    "UPDATE connections SET base_url = ?, api_key = ?, temperature = ? WHERE id = 1"
  );
  const result = stmt.run(settings.base_url, settings.api_key, settings.temperature);
  if (result.changes === 0) {
    db.prepare("INSERT INTO connections (id, base_url, api_key, temperature) VALUES (1, ?, ?, ?)").run(
      settings.base_url,
      settings.api_key,
      settings.temperature
    );
  }
}
export {
  getConnections as g,
  updateConnections as u
};
