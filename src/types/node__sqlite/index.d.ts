declare module 'node:sqlite' {
  export class DatabaseSync {
    constructor(path: string);
    exec(sql: string): void;
    prepare(sql: string): Statement;
  }

  export interface Statement {
    get<T = unknown>(...params: unknown[]): T | undefined;
    all<T = unknown>(...params: unknown[]): T[];
    run(...params: unknown[]): { changes: number };
  }
}
