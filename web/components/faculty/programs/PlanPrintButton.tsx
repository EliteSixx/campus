"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

// Opens the browser's print dialog for the development plan.
export function PlanPrintButton() {
  return (
    <Button type="button" size="sm" onClick={() => window.print()}>
      <Printer className="h-3.5 w-3.5" aria-hidden="true" />
      Print plan
    </Button>
  );
}
