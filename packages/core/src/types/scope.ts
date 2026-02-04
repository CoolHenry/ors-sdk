export type Extra = unknown;
export type Extras = Record<string, Extra>;
export type Context = Record<string, unknown>;

export type Contexts = Record<string, Context | undefined>;
export type Primitive =
  | number
  | string
  | boolean
  | bigint
  | symbol
  | null
  | undefined;
export interface User {
  [key: string]: any;
  id?: string | number;
  ip_address?: string | null;
  email?: string;
  username?: string;
}
