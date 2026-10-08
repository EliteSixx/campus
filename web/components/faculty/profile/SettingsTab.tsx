"use client";

import { AppearanceCard } from "./AppearanceCard";
import { DemoDataCard } from "./DemoDataCard";
import { NotificationsCard } from "./NotificationsCard";
import { ProfileSettingsCard } from "./ProfileSettingsCard";

// Account & settings. Everything here lives in this browser: the profile goes
// through the shared user profile context, appearance through the shared theme
// context, and the rest in this section's own localStorage keys.

export function SettingsTab({
  recordName,
  recordEmail,
}: {
  recordName: string;
  recordEmail: string;
}) {
  return (
    <>
      <h3 className="mt-6 text-sm font-bold text-ink">Account &amp; settings</h3>
      <div className="mt-3 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <ProfileSettingsCard recordName={recordName} recordEmail={recordEmail} />
          <NotificationsCard />
        </div>
        <AppearanceCard />
      </div>
      <div className="mt-6">
        <DemoDataCard />
      </div>
    </>
  );
}
