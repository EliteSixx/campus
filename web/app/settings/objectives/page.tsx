"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, GraduationCap, Edit3, Check } from "lucide-react";
import { useRole } from "@/context/role-context";
import { useUserProfile } from "@/context/user-profile-context";

export default function ObjectivesSettingsPage() {
  const { role } = useRole();
  const { currentProfile, updateProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [goal, setGoal] = useState(currentProfile.careerGoal || "");

  const handleSave = () => {
    updateProfile(role, { careerGoal: goal });
    setIsEditing(false);
  };

  return (
    <DashboardShell title="Settings / Objectives">
      <Card className="border border-border bg-surface text-ink shadow-sm max-w-2xl mt-4">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Target className="h-4.5 w-4.5 text-accent" />
            <div>
              <CardTitle className="text-base font-bold text-ink">Objectives</CardTitle>
              <CardDescription className="text-xs font-medium text-ink-muted">
                Manage your primary goals and focus areas.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent border border-accent/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-sm font-bold text-ink">
                {role === "student"
                  ? "Target Career Goal"
                  : role === "faculty"
                  ? "Mentor Focus"
                  : role === "institution"
                  ? "Institutional Objective"
                  : "Hiring Focus & Talent Pipeline"}
              </h3>
              <p className="text-xs text-ink-muted font-medium">
                What The Plug is optimizing your account telemetry toward.
              </p>
              
              <div className="pt-4 flex items-center gap-3">
                {isEditing ? (
                  <div className="flex items-center gap-2 w-full max-w-sm">
                    <Input 
                      value={goal} 
                      onChange={(e) => setGoal(e.target.value)} 
                      placeholder="Enter your primary objective..."
                      autoFocus
                    />
                    <Button size="sm" onClick={handleSave} className="gap-1 bg-accent text-white">
                      <Check className="h-3.5 w-3.5" /> Save
                    </Button>
                  </div>
                ) : (
                  <>
                    <Badge tone="accent" className="text-sm py-1.5 px-4 font-bold shadow-sm">
                      {currentProfile.careerGoal || "Not set yet"}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-ink-muted hover:text-ink">
                      <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
