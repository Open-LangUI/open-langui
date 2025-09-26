import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const dbPath = join(process.cwd(), 'data', 'languages.db');
mkdirSync(join(process.cwd(), 'data'), { recursive: true });

export const db = new DatabaseSync(dbPath);

db.exec(`CREATE TABLE IF NOT EXISTS languages (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  romanize INTEGER NOT NULL DEFAULT 0,
  prompt TEXT NOT NULL DEFAULT ''
);`);

type SeedLanguage = {
  name: string;
  code: string;
  romanize: boolean;
  prompt: string;
};

const seedLanguages: SeedLanguage[] = [
  { name: 'Auto', code: 'auto', romanize: false, prompt: '' },
  { name: 'English', code: 'en', romanize: false, prompt: 'Return phonetic sounds in KK system.' },
  { name: 'Chinese (Simplified)', code: 'zh-CN', romanize: true, prompt: 'Return romanization in pinyin.' },
  { name: 'Chinese (Traditional)', code: 'zh-TW', romanize: true, prompt: 'Return romanization in pinyin.' },
  { name: 'Japanese', code: 'ja', romanize: true, prompt: 'Return romanization in romaji.' },
  { name: 'Spanish', code: 'es', romanize: false, prompt: '' },
  { name: 'French', code: 'fr', romanize: false, prompt: '' }
];

const countStmt = db.prepare('SELECT COUNT(*) AS count FROM languages');
const row = countStmt.get() as { count: number } | undefined;
if (!row || row.count === 0) {
  const insert = db.prepare(
    'INSERT OR IGNORE INTO languages (code, name, romanize, prompt) VALUES (?, ?, ?, ?)'
  );

  const insertMany = db.transaction((languages: SeedLanguage[]) => {
    for (const lang of languages) {
      insert.run(lang.code, lang.name, lang.romanize ? 1 : 0, lang.prompt);
    }
  });

  insertMany(seedLanguages);
}

export const DEFAULT_SOURCE = 'auto';
export const DEFAULT_TARGET = 'zh-CN';
