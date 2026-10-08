"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { UserCircle, Edit3 } from "lucide-react";
import { useRole } from "@/context/role-context";
import { useUserProfile } from "@/context/user-profile-context";

export default function AccountSettingsPage() {
  const { role } = useRole();
  const { currentProfile, updateProfile } = useUserProfile();

  const [editForm, setEditForm] = useState({
    name: currentProfile.name || "",
    email: currentProfile.email || "",
    department: currentProfile.department || "",
    yearOrTitle: currentProfile.yearOrTitle || "",
    location: currentProfile.location || "",
    bio: currentProfile.bio || "",
    careerGoal: currentProfile.careerGoal || "",
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(role, editForm);
    // Ideally, show a success toast here
  };

  return (
    <DashboardShell title="Settings / Account Details">
      <Card className="border border-border bg-surface text-ink shadow-sm max-w-2xl">
        <CardHeader className="pb-3 border-b border-border mb-4">
          <div className="flex items-center gap-2">
            <UserCircle className="h-4.5 w-4.5 text-accent" />
            <div>
              <CardTitle className="text-base font-bold text-ink">Account Details</CardTitle>
              <CardDescription className="text-xs font-medium text-ink-muted">
                Update your personal information and public profile details.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Full Name</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-ink">Email Address</label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="you@institution.edu"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-ink">Location</label>
                <Input
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-ink">Department / Org</label>
                <Input
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  placeholder="e.g. Computer Science"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-ink">Designation / Year</label>
                <Input
                  value={editForm.yearOrTitle}
                  onChange={(e) => setEditForm({ ...editForm, yearOrTitle: e.target.value })}
                  placeholder="e.g. 3rd Year / Senior Engineer"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Profile Bio</label>
              <Textarea
                rows={4}
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Write a brief professional summary..."
              />
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-border mt-6">
              <Button type="submit" size="sm" className="gap-1.5 font-bold text-white bg-accent">
                <Edit3 className="h-4 w-4" />
                Save Profile Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
