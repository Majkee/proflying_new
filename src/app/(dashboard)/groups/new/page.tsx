"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GroupForm } from "@/components/groups/group-form";

export default function NewGroupPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Link href="/groups">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Powrot
          </Button>
        </Link>
      </div>
      <GroupForm />
    </div>
  );
}
