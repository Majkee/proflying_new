import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorCardProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorCard({
  message = "Wystapil blad podczas ladowania danych",
  onRetry,
}: ErrorCardProps) {
  return (
    <Card className="border-red-200">
      <CardContent className="p-6 text-center">
        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <p className="text-sm text-muted-foreground mb-4">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Sprobuj ponownie
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
