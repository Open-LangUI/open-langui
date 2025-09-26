import { getConnections } from '$lib/server/connections';
import type { RequestHandler } from './$types';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade'
]);

async function forward(event: Parameters<RequestHandler>[0]) {
  const { path = '' } = event.params;
  const { base_url: rawBaseUrl, api_key: apiKey } = getConnections();

  if (!rawBaseUrl) {
    return new Response('Missing LM Studio base URL configuration', { status: 500 });
  }

  const baseUrl = rawBaseUrl.replace(/\/+$/, '');
  const suffix = path ? `/${path}` : '';
  const targetUrl = `${baseUrl}${suffix}${event.url.search}`;

  const method = event.request.method.toUpperCase();
  const headers = new Headers();

  event.request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lower) || lower === 'host' || lower === 'content-length') {
      return;
    }

    headers.set(key, value);
  });

  if (apiKey && !headers.has('authorization')) {
    headers.set('authorization', `Bearer ${apiKey}`);
  }

  let body: BodyInit | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    const arrayBuffer = await event.request.arrayBuffer();
    body = arrayBuffer;
  }

  const init: RequestInit = {
    method,
    headers,
    body
  };

  try {
    const response = await fetch(targetUrl, init);

    const outgoingHeaders = new Headers();
    response.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (HOP_BY_HOP_HEADERS.has(lower)) {
        return;
      }
      outgoingHeaders.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: outgoingHeaders
    });
  } catch (error) {
    console.error('Proxy request failed', error);
    return new Response('Failed to reach LM Studio API', { status: 502 });
  }
}

export const GET: RequestHandler = async (event) => forward(event);
export const POST: RequestHandler = async (event) => forward(event);
export const PUT: RequestHandler = async (event) => forward(event);
export const PATCH: RequestHandler = async (event) => forward(event);
export const DELETE: RequestHandler = async (event) => forward(event);
