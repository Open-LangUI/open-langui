import { db, DEFAULT_SOURCE, DEFAULT_TARGET } from './database';

export type LanguageRow = {
  name: string;
  code: string;
  romanize: boolean;
  prompt: string;
};

export function getLanguages(): LanguageRow[] {
  const stmt = db.prepare('SELECT name, code, romanize, prompt FROM languages ORDER BY name');
  return stmt.all().map((row: any) => ({
    name: row.name,
    code: row.code,
    romanize: Boolean(row.romanize),
    prompt: row.prompt ?? ''
  }));
}

export { DEFAULT_SOURCE, DEFAULT_TARGET };
