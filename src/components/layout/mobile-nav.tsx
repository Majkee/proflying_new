"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useUser } from "@/lib/hooks/use-user";
import { NAV_ITEMS, MOBILE_MORE_ITEMS } from "@/lib/constants/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MobileNav() {
  const pathname = usePathname();
  const { profile } = useUser();
  const userRole = profile?.role;

  const mainItems = NAV_ITEMS.filter(
    (item) =>
      !item.mobileHidden &&
      (!item.roles || (userRole && item.roles.includes(userRole)))
  );

  const moreItems = MOBILE_MORE_ITEMS.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole))
  );

  const hasMoreItems = moreItems.length > 0;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {mainItems.slice(0, hasMoreItems ? 4 : 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-lg transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        {hasMoreItems && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-center justify-center gap-0.5 w-16 py-1 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-5 w-5" />
                <span className="text-[10px] font-medium">Wiecej</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-48 mb-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}
