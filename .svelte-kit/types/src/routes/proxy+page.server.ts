// @ts-nocheck
import type { PageServerLoad } from './$types';
import { getLanguages, DEFAULT_SOURCE, DEFAULT_TARGET } from '$lib/server/languages';
import { getConnections } from '$lib/server/connections';

export const load = async () => {
  const languages = getLanguages();
  const connections = getConnections();

  return {
    languages,
    defaultSource: DEFAULT_SOURCE,
    defaultTarget: DEFAULT_TARGET,
    connections
  };
};
;null as any as PageServerLoad;