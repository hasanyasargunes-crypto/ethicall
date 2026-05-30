import { createClient } from "next-sanity";
import { sanityConfig } from "./env";

export const client = createClient({
  ...sanityConfig,
  stega: { enabled: false },
});

export async function sanityFetch<T>(
  query: string,
  params?: Record<string, unknown>,
  tags?: string[],
): Promise<T> {
  return client.fetch<T>(query, params ?? {}, {
    next: { revalidate: 60, tags: tags ?? ["sanity"] },
  });
}
