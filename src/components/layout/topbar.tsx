"use client";

import { Menu } from "lucide-react";
import { StudioSwitcher } from "./studio-switcher";
import { NotificationBell } from "./notification-bell";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  onMenuToggle?: () => void;
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuToggle}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Menu</span>
      </Button>
      <div className="flex-1">
        <StudioSwitcher />
      </div>
      <NotificationBell />
      <UserMenu />
    </header>
  );
}
