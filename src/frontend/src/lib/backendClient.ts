import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";

let _instance: backendInterface | null = null;
let _pending: Promise<backendInterface> | null = null;

export async function getBackend(): Promise<backendInterface> {
  if (_instance) return _instance;
  if (_pending) return _pending;
  _pending = createActorWithConfig().then((actor) => {
    _instance = actor;
    _pending = null;
    return actor;
  });
  return _pending;
}

// Convenience proxy — every method call waits for the backend to be ready
export const backend = new Proxy({} as backendInterface, {
  get(_target, prop: string) {
    return (...args: unknown[]) =>
      getBackend().then((b) =>
        (b as unknown as Record<string, (...a: unknown[]) => unknown>)[prop](
          ...args,
        ),
      );
  },
});
