"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { CircleCheck, RotateCcw, UserRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserProfile } from "@/context/user-profile-context";
import { labelClass } from "@/components/faculty/curriculum/utils";

// The name and email the app shows for the faculty role. They are saved through
// the shared user profile context (localStorage "skillsync-user-profiles"),
// always under the faculty role, whichever role is active.
//
// The context can also hold a department, title, location and bio, but its
// faculty defaults for those do not match data/faculty-profile.ts, so editing
// them here would show two different designations. Only name and email are
// offered.

const MAX_NAME = 80;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ProfileSettingsCard({
  recordName,
  recordEmail,
}: {
  recordName: string;
  recordEmail: string;
}) {
  const ids = useId();
  const { profiles, updateProfile } = useUserProfile();
  const stored = profiles.faculty;

  // An empty saved value means "use the faculty record".
  const savedName = stored.name.trim() || recordName;
  const savedEmail = stored.email.trim() || recordEmail;

  const [name, setName] = useState(savedName);
  const [email, setEmail] = useState(savedEmail);
  const [status, setStatus] = useState<string | null>(null);

  // The context reads localStorage after mount, so the saved values can arrive
  // a moment after the first render. Kept apart so resetting the name leaves an
  // unsaved email edit alone.
  useEffect(() => {
    setName(savedName);
  }, [savedName]);
  useEffect(() => {
    setEmail(savedEmail);
  }, [savedEmail]);

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const nameError = trimmedName === "" ? "Enter your name." : null;
  const emailError =
    trimmedEmail !== "" && !EMAIL_PATTERN.test(trimmedEmail)
      ? "Enter a full email address, like name@university.edu."
      : null;
  const changed =
    trimmedName !== savedName || (trimmedEmail || recordEmail) !== savedEmail;
  const canSave = changed && nameError === null && emailError === null;

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;
    updateProfile("faculty", { name: trimmedName, email: trimmedEmail });
    setStatus("Saved");
  }

  function resetName() {
    updateProfile("faculty", { name: recordName });
    setName(recordName);
    setStatus("Name reset to your faculty record");
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            How your name and email appear across The Plug
          </CardDescription>
        </div>
        <UserRound className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <form onSubmit={save} noValidate className="space-y-4">
          <div>
            <label htmlFor={`${ids}-name`} className={labelClass}>
              Name
            </label>
            <Input
              id={`${ids}-name`}
              value={name}
              maxLength={MAX_NAME}
              autoComplete="name"
              aria-invalid={nameError !== null}
              aria-describedby={`${ids}-name-help`}
              onChange={(e) => {
                setName(e.target.value);
                setStatus(null);
              }}
            />
            <p
              id={`${ids}-name-help`}
              className={nameError ? "mt-1 text-xs text-danger" : "mt-1 text-xs text-ink-muted"}
            >
              {nameError ?? `On your faculty record: ${recordName}`}
            </p>
          </div>

          <div>
            <label htmlFor={`${ids}-email`} className={labelClass}>
              Contact email
            </label>
            <Input
              id={`${ids}-email`}
              type="email"
              value={email}
              autoComplete="email"
              aria-invalid={emailError !== null}
              aria-describedby={`${ids}-email-help`}
              onChange={(e) => {
                setEmail(e.target.value);
                setStatus(null);
              }}
            />
            <p
              id={`${ids}-email-help`}
              className={emailError ? "mt-1 text-xs text-danger" : "mt-1 text-xs text-ink-muted"}
            >
              {emailError ?? "Leave empty to use the email on your faculty record."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <Button type="submit" size="sm" disabled={!canSave}>
              Save
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={resetName}
              disabled={savedName === recordName}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset name to default
            </Button>
            <p
              role="status"
              className="flex items-center gap-1.5 text-xs font-semibold text-success"
            >
              {status && (
                <>
                  <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  {status}
                </>
              )}
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
