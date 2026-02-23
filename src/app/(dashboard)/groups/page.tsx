import type { Metadata } from "next";
import { GroupsPageContent } from "@/components/groups/groups-page-content";

export const metadata: Metadata = {
  title: "Grupy",
};

export default function GroupsPage() {
  return <GroupsPageContent />;
}
