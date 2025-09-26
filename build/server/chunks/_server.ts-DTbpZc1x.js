import { j as json } from './index-DL1kGxeb.js';
import { d as db } from './database-DPmGJg9n.js';
import 'node:sqlite';
import 'node:fs';
import 'node:path';

const POST = async ({ params }) => {
  const code = params.code;
  if (!code) return json({ error: "Code required" }, { status: 400 });
  try {
    const row = db.prepare("SELECT name, code, romanize, prompt FROM lang_db WHERE code = ?").get(code);
    if (!row) return json({ error: "Language not found in library" }, { status: 404 });
    const exists = db.prepare("SELECT 1 FROM languages WHERE code = ?").get(code);
    if (exists) return json({ success: true });
    db.prepare("INSERT INTO languages (code, name, romanize, prompt) VALUES (?, ?, ?, ?)").run(
      row.code,
      row.name,
      row.romanize ? 1 : 0,
      row.prompt ?? ""
    );
    return json({ success: true });
  } catch (e) {
    console.error("Failed to add language", e);
    return json({ error: "Failed to add language" }, { status: 500 });
  }
};

export { POST };
//# sourceMappingURL=_server.ts-DTbpZc1x.js.map
