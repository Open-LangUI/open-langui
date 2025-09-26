import { db } from './database';

export type ConnectionSettings = {
  base_url: string;
  api_key: string;
  temperature: number;
};

export function getConnections(): ConnectionSettings {
  const row = db
    .prepare('SELECT base_url, api_key, temperature FROM connections WHERE id = 1')
    .get() as { base_url: string; api_key: string | null; temperature: number } | undefined;

  if (!row) {
    return {
      base_url: 'http://localhost:1234',
      api_key: '',
      temperature: 0.2
    };
  }

  return {
    base_url: row.base_url,
    api_key: row.api_key ?? '',
    temperature: typeof row.temperature === 'number' ? row.temperature : Number(row.temperature) || 0.2
  };
}

export function updateConnections(settings: ConnectionSettings): void {
  const stmt = db.prepare(
    'UPDATE connections SET base_url = ?, api_key = ?, temperature = ? WHERE id = 1'
  );
  const result = stmt.run(settings.base_url, settings.api_key, settings.temperature);

  if (result.changes === 0) {
    db.prepare('INSERT INTO connections (id, base_url, api_key, temperature) VALUES (1, ?, ?, ?)').run(
      settings.base_url,
      settings.api_key,
      settings.temperature
    );
  }
}