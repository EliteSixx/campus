import { Clock, Mail, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { FacultyProfileDetail } from "@/data/faculty-profile";
import { initialsOf } from "./utils";

// Who this faculty member is and how to reach them. The name and email are the
// ones chosen on the settings tab when set, otherwise the faculty record's.

export function ProfileHeader({
  record,
  name,
  email,
}: {
  record: FacultyProfileDetail;
  name: string;
  email: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent text-xl font-extrabold text-white shadow-md"
            aria-hidden="true"
          >
            {initialsOf(name)}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-ink">{name}</h2>
            <p className="mt-0.5 text-sm text-ink-muted">
              {record.designation} · {record.department}
            </p>
            <p className="mt-1.5 text-xs text-ink-muted">
              <span className="tabular text-ink">{record.employeeId}</span> ·{" "}
              <span className="tabular">{record.yearsOfExperience}</span> years
              experience · teaching since{" "}
              <span className="tabular">{record.teachingSince}</span>
            </p>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-ink-muted">
          <p className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="sr-only">Email: </span>
            <span className="break-all">{email}</span>
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="sr-only">Office: </span>
            {record.officeRoom}
          </p>
          {record.officeHours.length > 0 && (
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <div className="space-y-0.5">
                <p className="sr-only">Office hours:</p>
                {record.officeHours.map((hour) => (
                  <p key={hour.day} className="tabular">
                    {hour.day} — {hour.slot}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
