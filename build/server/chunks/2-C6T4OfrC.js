import { D as DEFAULT_TARGET, a as DEFAULT_SOURCE, d as db } from './database-DPmGJg9n.js';
import { g as getConnections } from './connections-B7JSRTv3.js';
import 'node:sqlite';
import 'node:fs';
import 'node:path';

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

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 2;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CAWcV3Xb.js')).default;
const server_id = "src/routes/+page.server.ts";
const imports = ["_app/immutable/nodes/2.BeV_dA74.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/CZYVMSbA.js","_app/immutable/chunks/DJ8JGTRo.js","_app/immutable/chunks/DcF3xoQD.js","_app/immutable/chunks/F2tdbd6K.js","_app/immutable/chunks/DspkWKzF.js","_app/immutable/chunks/YZs77HQT.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=2-C6T4OfrC.js.map
