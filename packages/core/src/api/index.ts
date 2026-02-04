import type { Extra } from "@/types/scope";
export { setTag } from "./setTag";
export { setUser } from "./setUser";
export { captureException, captureMessage } from "./captureError";
import { scopeHub, Scope } from "./scope";
export function setExtra(key: string, value: Extra) {
  scopeHub.getCurrentScope().setExtra(key, value);
}

export function withScope(cb: (scope: Scope) => void) {
  scopeHub.withScope(cb);
}
