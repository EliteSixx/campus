"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/role-context";
import { LoadingState } from "@/components/shared/state";

export default function DashboardIndexPage() {
  const { role } = useRole();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/${role}`);
  }, [role, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <LoadingState label="Loading your dashboard" />
    </div>
  );
}
