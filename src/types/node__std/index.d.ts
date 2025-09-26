declare module 'node:fs' {
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
}

declare module 'node:path' {
  export function join(...segments: string[]): string;
}

declare const process: {
  cwd(): string;
};
