"use client";

import { Building2, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStudio } from "@/lib/hooks/use-studio";
import { useUser } from "@/lib/hooks/use-user";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

export default function StudiosPage() {
  const { studios, switchStudio, setAllStudios } = useStudio();
  const { profile } = useUser();
  const router = useRouter();

  const handleSelect = (studioId: string) => {
    switchStudio(studioId);
    router.push("/dashboard");
  };

  const handleAllStudios = () => {
    setAllStudios();
    router.push("/dashboard");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Wybierz studio"
        description="Wybierz studio, w ktorym chcesz pracowac"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {studios.map((studio) => (
          <Card
            key={studio.id}
            className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
            onClick={() => handleSelect(studio.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{studio.name}</h3>
                  {studio.address && (
                    <p className="text-sm text-muted-foreground mt-1">{studio.address}</p>
                  )}
                  {studio.phone && (
                    <p className="text-sm text-muted-foreground">{studio.phone}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {profile?.role === "super_admin" && (
          <Card
            className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all border-dashed"
            onClick={handleAllStudios}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Wszystkie studia</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Widok zbiorczy dla wszystkich lokalizacji
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
