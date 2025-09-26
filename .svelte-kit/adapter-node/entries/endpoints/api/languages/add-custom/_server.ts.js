import { json } from "@sveltejs/kit";
import { d as db } from "../../../../../chunks/database.js";
const POST = async ({ request }) => {
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
    const insertLanguage = db.prepare(
      "INSERT INTO languages (code, name, romanize, prompt) VALUES (?, ?, ?, ?)"
    );
    insertLanguage.run(code, name, romanize ? 1 : 0, prompt);
    return json({ success: true });
  } catch (error) {
    if (error?.code === "SQLITE_CONSTRAINT_PRIMARYKEY") {
      return json({ error: "A language with that code already exists." }, { status: 400 });
    }
    console.error("Failed to add custom language:", error);
    return json({ error: "Failed to add language." }, { status: 500 });
  }
};
export {
  POST
};
