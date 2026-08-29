import { frontendEnv } from "@repo/env/client";
import { httpLink, httpBatchStreamLink } from "@repo/trpc/client";
import { createBrowserClient } from "@supabase/ssr";

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
}

async function getAuthToken(): Promise<string | null> {
  // Use createBrowserClient (same as the rest of the app) so it reads
  // from the cookie-based session set by @supabase/ssr — NOT localStorage.
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export const createTRPCHttpBatchClientClient = (opts?: CreateTRPCHttpBatchClientClientOpts) => {
  const c = opts?.enableStreaming ? httpBatchStreamLink : httpLink;

  const baseUrl = frontendEnv.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  return c({
    url: `${baseUrl}/trpc`,
    async headers() {
      const token = await getAuthToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
  });
};
