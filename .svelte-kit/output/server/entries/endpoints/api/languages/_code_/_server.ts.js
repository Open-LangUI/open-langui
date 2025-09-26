import { json } from "@sveltejs/kit";
import { d as db } from "../../../../../chunks/database.js";
const PUT = async ({ params, request }) => {
  const originalCode = params.code;
  if (!originalCode) {
    return json({ error: "Language code is required." }, { status: 400 });
  }
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON payload." }, { status: 400 });
  }
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const code = typeof payload.code === "string" ? payload.code.trim() : "";
  const prompt = typeof payload.prompt === "string" ? payload.prompt : "";
  const romanize = Boolean(payload.romanize);
  if (!name || !code) {
    return json({ error: "Name and code are required." }, { status: 400 });
  }
  try {
    const stmt = db.prepare(
      "UPDATE languages SET code = ?, name = ?, romanize = ?, prompt = ? WHERE code = ?"
    );
    const result = stmt.run(code, name, romanize ? 1 : 0, prompt, originalCode);
    if (result.changes === 0) {
      return json({ error: "Language not found." }, { status: 404 });
    }
    return json({ success: true });
  } catch (error) {
    if (error?.code === "SQLITE_CONSTRAINT_PRIMARYKEY") {
      return json({ error: "A language with that code already exists." }, { status: 400 });
    }
    console.error("Failed to update language:", error);
    return json({ error: "Failed to update language." }, { status: 500 });
  }
};
const DELETE = async ({ params }) => {
  const code = params.code;
  if (!code) return json({ error: "Language code is required." }, { status: 400 });
  try {
    if (code === "auto") return json({ error: "Cannot delete auto language." }, { status: 400 });
    const stmt = db.prepare("DELETE FROM languages WHERE code = ?");
    const result = stmt.run(code);
    if (result.changes === 0) return json({ error: "Language not found." }, { status: 404 });
    return json({ success: true });
  } catch (e) {
    console.error("Failed to delete language", e);
    return json({ error: "Failed to delete language." }, { status: 500 });
  }
};
export {
  DELETE,
  PUT
};
