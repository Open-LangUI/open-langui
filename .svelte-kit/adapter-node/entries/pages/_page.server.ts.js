import { d as db, D as DEFAULT_TARGET, a as DEFAULT_SOURCE } from "../../chunks/database.js";
import { g as getConnections } from "../../chunks/connections.js";
function getLanguages() {
  const stmt = db.prepare(
    "SELECT name, code, romanize, prompt FROM languages ORDER BY CASE WHEN code = 'auto' THEN 0 ELSE 1 END, name"
  );
  return stmt.all().map((row) => ({
    name: row.name,
    code: row.code,
    romanize: Boolean(row.romanize),
    prompt: row.prompt ?? ""
  }));
}
const load = async () => {
  const languages = getLanguages();
  const connections = getConnections();
  return {
    languages,
    defaultSource: DEFAULT_SOURCE,
    defaultTarget: DEFAULT_TARGET,
    connections
  };
};
export {
  load
};
