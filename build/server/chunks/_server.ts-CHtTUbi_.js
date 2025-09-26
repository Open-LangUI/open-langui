import { j as json } from './index-DL1kGxeb.js';
import { d as db } from './database-DPmGJg9n.js';
import 'node:sqlite';
import 'node:fs';
import 'node:path';

const GET = async () => {
  try {
    const rows = db.prepare(
      `SELECT ldb.name, ldb.code, ldb.romanize, ldb.prompt
         FROM lang_db ldb
         WHERE NOT EXISTS (SELECT 1 FROM languages l WHERE l.code = ldb.code)
         ORDER BY ldb.name`
    ).all().map((r) => ({
      name: r.name,
      code: r.code,
      romanize: Boolean(r.romanize),
      prompt: r.prompt ?? ""
    }));
    return json({ languages: rows });
  } catch (e) {
    console.error("Failed to get addable languages", e);
    return json({ error: "Failed to get addable languages" }, { status: 500 });
  }
};

export { GET };
//# sourceMappingURL=_server.ts-CHtTUbi_.js.map
