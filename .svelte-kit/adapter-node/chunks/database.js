import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
const dbPath = join(process.cwd(), "data", "languages.db");
mkdirSync(join(process.cwd(), "data"), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec(`CREATE TABLE IF NOT EXISTS languages (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  romanize INTEGER NOT NULL DEFAULT 0,
  prompt TEXT NOT NULL DEFAULT ''
);`);
db.exec(`CREATE TABLE IF NOT EXISTS lang_db (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  romanize INTEGER NOT NULL DEFAULT 0,
  prompt TEXT NOT NULL DEFAULT ''
);`);
db.exec(`CREATE TABLE IF NOT EXISTS connections (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  base_url TEXT NOT NULL,
  api_key TEXT DEFAULT '',
  temperature REAL NOT NULL DEFAULT 0.2
);`);
const seedLanguages = [
  { name: "Auto", code: "auto", romanize: false, prompt: "" },
  { name: "English", code: "en", romanize: false, prompt: "Return phonetic sounds in KK system." },
  { name: "Chinese (Simplified)", code: "zh-CN", romanize: true, prompt: "Return romanization in pinyin." },
  { name: "Chinese (Traditional)", code: "zh-TW", romanize: true, prompt: "Return romanization in pinyin." },
  { name: "Japanese", code: "ja", romanize: true, prompt: "Return romanization in romaji." },
  { name: "Spanish", code: "es", romanize: false, prompt: "" },
  { name: "French", code: "fr", romanize: false, prompt: "" },
  { name: "Korean", code: "ko", romanize: true, prompt: "Return romanization in Revised Romanization." }
];
const countStmt = db.prepare("SELECT COUNT(*) AS count FROM languages");
const row = countStmt.get();
const insertLanguage = db.prepare(
  "INSERT OR IGNORE INTO languages (code, name, romanize, prompt) VALUES (?, ?, ?, ?)"
);
const insertLibraryLanguage = db.prepare(
  "INSERT OR IGNORE INTO lang_db (code, name, romanize, prompt) VALUES (?, ?, ?, ?)"
);
if (!row || row.count === 0) {
  for (const lang of seedLanguages) {
    insertLanguage.run(lang.code, lang.name, lang.romanize ? 1 : 0, lang.prompt);
  }
}
const libraryCount = db.prepare("SELECT COUNT(*) AS count FROM lang_db").get();
if (!libraryCount || libraryCount.count === 0) {
  for (const lang of seedLanguages) {
    insertLibraryLanguage.run(lang.code, lang.name, lang.romanize ? 1 : 0, lang.prompt);
  }
}
const connectionCount = db.prepare("SELECT COUNT(*) AS count FROM connections").get();
if (!connectionCount || connectionCount.count === 0) {
  db.prepare("INSERT INTO connections (id, base_url, api_key, temperature) VALUES (1, ?, ?, ?)").run(
    "http://localhost:1234",
    "",
    0.2
  );
}
const DEFAULT_SOURCE = "auto";
const DEFAULT_TARGET = "zh-TW";
export {
  DEFAULT_TARGET as D,
  DEFAULT_SOURCE as a,
  db as d
};
