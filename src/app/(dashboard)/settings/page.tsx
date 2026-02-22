"use client";

import Link from "next/link";
import { Building2, Users, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

export default function SettingsPage() {
  const settingsItems = [
    {
      title: "Studia",
      description: "Zarzadzaj lokalizacjami studia",
      href: "/settings/studios",
      icon: Building2,
    },
    {
      title: "Uzytkownicy",
      description: "Zarzadzaj kontami uzytkownikow i uprawnieniami",
      href: "/settings/users",
      icon: Users,
    },
  ];

  return (
    <div>
      <PageHeader title="Ustawienia" description="Zarzadzaj ustawieniami akademii" />

      <div className="grid gap-3 max-w-2xl">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
