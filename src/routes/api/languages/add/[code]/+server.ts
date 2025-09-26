import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/database';

export const POST: RequestHandler = async ({ params }) => {
  const code = params.code;
  if (!code) return json({ error: 'Code required' }, { status: 400 });

  try {
    const row = db.prepare('SELECT name, code, romanize, prompt FROM lang_db WHERE code = ?').get(code) as
      | { name: string; code: string; romanize: number; prompt: string }
      | undefined;
    if (!row) return json({ error: 'Language not found in library' }, { status: 404 });

    const exists = db.prepare('SELECT 1 FROM languages WHERE code = ?').get(code) as any;
    if (exists) return json({ success: true });

    db.prepare('INSERT INTO languages (code, name, romanize, prompt) VALUES (?, ?, ?, ?)').run(
      row.code,
      row.name,
      row.romanize ? 1 : 0,
      row.prompt ?? ''
    );

    return json({ success: true });
  } catch (e) {
    console.error('Failed to add language', e);
    return json({ error: 'Failed to add language' }, { status: 500 });
  }
};

