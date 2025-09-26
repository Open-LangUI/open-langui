
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/api" | "/api/connections" | "/api/languages" | "/api/languages/add-custom" | "/api/languages/addable" | "/api/languages/add" | "/api/languages/add/[code]" | "/api/languages/[code]" | "/api/proxy" | "/api/proxy/[...path]";
		RouteParams(): {
			"/api/languages/add/[code]": { code: string };
			"/api/languages/[code]": { code: string };
			"/api/proxy/[...path]": { path: string }
		};
		LayoutParams(): {
			"/": { code?: string; path?: string };
			"/api": { code?: string; path?: string };
			"/api/connections": Record<string, never>;
			"/api/languages": { code?: string };
			"/api/languages/add-custom": Record<string, never>;
			"/api/languages/addable": Record<string, never>;
			"/api/languages/add": { code?: string };
			"/api/languages/add/[code]": { code: string };
			"/api/languages/[code]": { code: string };
			"/api/proxy": { path?: string };
			"/api/proxy/[...path]": { path: string }
		};
		Pathname(): "/" | "/api" | "/api/" | "/api/connections" | "/api/connections/" | "/api/languages" | "/api/languages/" | "/api/languages/add-custom" | "/api/languages/add-custom/" | "/api/languages/addable" | "/api/languages/addable/" | "/api/languages/add" | "/api/languages/add/" | `/api/languages/add/${string}` & {} | `/api/languages/add/${string}/` & {} | `/api/languages/${string}` & {} | `/api/languages/${string}/` & {} | "/api/proxy" | "/api/proxy/" | `/api/proxy/${string}` & {} | `/api/proxy/${string}/` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/.DS_Store" | "/apple-touch-icon-precomposed.png" | "/apple-touch-icon.png" | "/favicon.ico" | "/favicon.png" | "/images/.DS_Store" | "/images/openlang.svg" | "/images/preferences.svg" | "/images/slash.svg" | "/robots.txt" | string & {};
	}
}