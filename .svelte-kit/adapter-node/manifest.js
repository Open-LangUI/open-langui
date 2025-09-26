export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([".DS_Store","apple-touch-icon-precomposed.png","apple-touch-icon.png","favicon.ico","favicon.png","images/.DS_Store","images/openlang.svg","images/preferences.svg","images/slash.svg","robots.txt"]),
	mimeTypes: {".png":"image/png",".svg":"image/svg+xml",".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.CQLNxFNa.js",app:"_app/immutable/entry/app.BhQed9qS.js",imports:["_app/immutable/entry/start.CQLNxFNa.js","_app/immutable/chunks/CKgdIqQA.js","_app/immutable/chunks/DcF3xoQD.js","_app/immutable/chunks/DJ8JGTRo.js","_app/immutable/entry/app.BhQed9qS.js","_app/immutable/chunks/DJ8JGTRo.js","_app/immutable/chunks/DcF3xoQD.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/F2tdbd6K.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/connections",
				pattern: /^\/api\/connections\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/connections/_server.ts.js'))
			},
			{
				id: "/api/languages/add-custom",
				pattern: /^\/api\/languages\/add-custom\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/languages/add-custom/_server.ts.js'))
			},
			{
				id: "/api/languages/addable",
				pattern: /^\/api\/languages\/addable\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/languages/addable/_server.ts.js'))
			},
			{
				id: "/api/languages/add/[code]",
				pattern: /^\/api\/languages\/add\/([^/]+?)\/?$/,
				params: [{"name":"code","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/languages/add/_code_/_server.ts.js'))
			},
			{
				id: "/api/languages/[code]",
				pattern: /^\/api\/languages\/([^/]+?)\/?$/,
				params: [{"name":"code","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/languages/_code_/_server.ts.js'))
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

export const prerendered = new Set([]);

export const base = "";