export type Language = {
  name: string;
  code: string;
  romanize: boolean;
  prompt: string;
};

export type ConnectionSettings = {
  base_url: string;
  api_key: string;
  temperature: number;
};

export type LanguageRecord = Language & { created_at?: string; updated_at?: string };

export type ServerLanguage = {
  name: string;
  code: string;
  romanize: number | boolean;
  prompt: string | null;
};

export type PreferencesTab = 'connections' | 'languages' | 'language-edit' | 'languages-add';
