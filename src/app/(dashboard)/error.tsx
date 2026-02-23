"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardError({
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
    <div className="flex items-center justify-center py-12">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Cos poszlo nie tak</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Wystapil nieoczekiwany blad. Sprobuj ponownie lub skontaktuj sie z administratorem.
          </p>
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sprobuj ponownie
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
