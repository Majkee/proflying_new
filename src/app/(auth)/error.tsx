"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Blad logowania</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Wystapil blad podczas logowania. Sprobuj ponownie.
        </p>
        <Button onClick={reset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Sprobuj ponownie
        </Button>
      </div>
    </div>
  );
}
