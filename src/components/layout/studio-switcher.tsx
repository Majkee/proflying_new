"use client";

import { Building2, ChevronDown } from "lucide-react";
import { useStudio } from "@/lib/hooks/use-studio";
import { useUser } from "@/lib/hooks/use-user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function StudioSwitcher() {
  const { activeStudio, studios, switchStudio } = useStudio();
  const { profile } = useUser();

  if (studios.length <= 1 && profile?.role !== "super_admin") {
    return (
      <div className="flex items-center gap-2 px-2">
        <Building2 className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium truncate">
          {activeStudio?.name ?? "Brak studia"}
        </span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium truncate max-w-[160px]">
            {activeStudio?.name ?? "Wybierz studio"}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Studia</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {studios.map((studio) => (
          <DropdownMenuItem
            key={studio.id}
            onClick={() => switchStudio(studio.id)}
            className={activeStudio?.id === studio.id ? "bg-accent" : ""}
          >
            <Building2 className="mr-2 h-4 w-4" />
            <div className="flex flex-col">
              <span>{studio.name}</span>
              {studio.address && (
                <span className="text-xs text-muted-foreground">{studio.address}</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
