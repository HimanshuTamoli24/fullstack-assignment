import { frontendEnv } from "@repo/env/client";
import { httpLink, httpBatchStreamLink } from "@repo/trpc/client";

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("taskflow_token") || localStorage.getItem("token") || null;
}

export const createTRPCHttpBatchClientClient = (opts?: CreateTRPCHttpBatchClientClientOpts) => {
  const c = opts?.enableStreaming ? httpBatchStreamLink : httpLink;
  const baseUrl = frontendEnv.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  return c({
    url: `${baseUrl}/trpc`,
    async headers() {
      const token = getAuthToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    fetch(url, options) {
      return fetch(url, {
        ...options,
        credentials: "include",
      });
    },
  });
};
