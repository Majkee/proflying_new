"use client";

import { LogOut, User } from "lucide-react";
import { useUser } from "@/lib/hooks/use-user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const roleLabels: Record<string, string> = {
  super_admin: "Administrator",
  manager: "Manager",
  instructor: "Instruktor",
};

export function UserMenu() {
  const { profile, signOut } = useUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full hover:bg-accent p-1 transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {profile?.full_name ? getInitials(profile.full_name) : <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{profile?.full_name ?? "Uzytkownik"}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {profile?.role ? roleLabels[profile.role] : ""}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Wyloguj sie
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
