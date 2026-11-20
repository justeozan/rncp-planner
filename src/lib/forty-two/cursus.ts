import type { FortyTwoCursus } from "@/types/forty-two";

// No account: there is no 42 data to load, so the store falls back to its
// default empty cursus (level 0, no projects).
export function getFortyTwoCursus(): Promise<FortyTwoCursus | undefined> {
  return Promise.resolve(undefined);
}
