import * as server from '../entries/pages/_page.server.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.ts";
export const imports = ["_app/immutable/nodes/2.BeV_dA74.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/CZYVMSbA.js","_app/immutable/chunks/DJ8JGTRo.js","_app/immutable/chunks/DcF3xoQD.js","_app/immutable/chunks/F2tdbd6K.js","_app/immutable/chunks/DspkWKzF.js","_app/immutable/chunks/YZs77HQT.js"];
export const stylesheets = [];
export const fonts = [];
