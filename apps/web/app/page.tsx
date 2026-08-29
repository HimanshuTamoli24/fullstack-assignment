"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from "lucide-react";

import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";

import { api } from "~/trpc/server";

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<{ status: string } | null>(null);

  async function checkHealth() {
    setLoading(true);
    setError(null);

    try {
      const data = await api.health.getHealth.query();
      setHealth(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 lg:px-12">
        <div className="grid w-full gap-16 lg:grid-cols-2">
          {/* Left */}
          <section className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium">
              Production Ready
            </span>

            <h1 className="text-5xl font-bold tracking-tight">
              Full Stack
              <br />
              <span className="text-primary">tRPC Monorepo Starter</span>
            </h1>

            <p className="mt-6 max-w-xl text-muted-foreground text-lg">
              A production-ready starter powered by Next.js, TypeScript, Turborepo and tRPC. Build
              applications instead of rebuilding the same infrastructure every time.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <Feature title="Next.js App Router" />
              <Feature title="End-to-End Type Safety" />
              <Feature title="Shared UI Package" />
              <Feature title="Shared Hooks & Utils" />
              <Feature title="Tailwind CSS v4" />
              <Feature title="Health Check API" />
            </div>
          </section>

          {/* Right */}
          <section className="flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Connection Status</CardTitle>
                <CardDescription>Verify frontend ↔ backend communication.</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <span className="text-sm font-medium">Status</span>

                  {loading ? (
                    <div className="flex items-center gap-2 text-amber-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Checking
                    </div>
                  ) : error ? (
                    <div className="flex items-center gap-2 text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      Offline
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Connected
                    </div>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <Row
                    label="API"
                    value={process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}
                  />

                  <Row label="Procedure" value="health.getHealth" />
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <pre className="overflow-auto text-xs">
                    {loading ? "Loading..." : error ? error : JSON.stringify(health, null, 2)}
                  </pre>
                </div>

                <Button onClick={checkHealth} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Check Again
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}

function Feature({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2">
      <ArrowRight className="h-4 w-4 text-primary" />
      <span>{title}</span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b pb-2">
      <span className="text-muted-foreground">{label}</span>
      <code className="text-xs">{value}</code>
    </div>
  );
}
