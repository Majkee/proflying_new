"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
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
    <html lang="pl">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
              Cos poszlo nie tak
            </h2>
            <p style={{ color: "#666", marginBottom: 24 }}>
              Wystapil nieoczekiwany blad. Sprobuj ponownie.
            </p>
            <button
              onClick={reset}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "1px solid #e5e5e5",
                background: "#fff",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Sprobuj ponownie
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
