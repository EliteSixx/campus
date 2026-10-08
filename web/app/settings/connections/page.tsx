"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Code2, Globe, Award, CheckCircle2, X } from "lucide-react";
import { useRole } from "@/context/role-context";
import { useUserProfile, ConnectedAccountsMap } from "@/context/user-profile-context";

function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

const platformMeta: Record<
  keyof ConnectedAccountsMap,
  { name: string; description: string; icon: any; placeholder: string; telemetryText: string }
> = {
  google: {
    name: "Google Workspace / SSO",
    description: "OAuth 2.0 institutional authentication & Drive verification",
    icon: GoogleIcon,
    placeholder: "your.name@gmail.com or @institution.edu",
    telemetryText: "Verified Institutional Domain",
  },
  github: {
    name: "GitHub",
    description: "Verify commit telemetry, repositories & open-source projects",
    icon: Code2,
    placeholder: "github_username",
    telemetryText: "420 Commits · 14 Repositories Sync",
  },
  linkedin: {
    name: "LinkedIn",
    description: "Sync professional summary & verified peer skill endorsements",
    icon: Globe,
    placeholder: "linkedin.com/in/username",
    telemetryText: "24 Verified Peer Endorsements",
  },
  leetcode: {
    name: "LeetCode",
    description: "Import algorithmic rating, contest badge & solved problems",
    icon: Award,
    placeholder: "leetcode_handle",
    telemetryText: "285 Problems Solved · 1740 Rating",
  },
  hackerrank: {
    name: "HackerRank",
    description: "Sync star ratings & verified domain certifications",
    icon: Code2,
    placeholder: "hackerrank_username",
    telemetryText: "5-Star Problem Solving",
  },
  kaggle: {
    name: "Kaggle",
    description: "Sync machine learning competition ranks & published notebooks",
    icon: Globe,
    placeholder: "kaggle_username",
    telemetryText: "Kaggle Notebooks Expert",
  },
};

export default function ConnectionsSettingsPage() {
  const { role } = useRole();
  const { currentProfile, toggleConnectedAccount } = useUserProfile();

  const [connectingPlatform, setConnectingPlatform] = useState<keyof ConnectedAccountsMap | null>(null);
  const [handleInput, setHandleInput] = useState("");

  const handleConnectClick = (platformKey: keyof ConnectedAccountsMap) => {
    const acc = currentProfile.connectedAccounts[platformKey];
    if (acc.connected) {
      toggleConnectedAccount(role, platformKey);
    } else {
      setConnectingPlatform(platformKey);
      setHandleInput(acc.handle || "");
    }
  };

  const confirmConnect = () => {
    if (connectingPlatform) {
      toggleConnectedAccount(role, connectingPlatform, handleInput.trim() || "connected_user");
      setConnectingPlatform(null);
      setHandleInput("");
    }
  };

  return (
    <DashboardShell title="Settings / Connected Platforms">
      <Card className="border border-border bg-surface text-ink shadow-sm max-w-4xl mt-4">
        <CardHeader className="pb-3 border-b border-border mb-4">
          <div className="flex items-center gap-2">
            <Link2 className="h-4.5 w-4.5 text-accent" />
            <div>
              <CardTitle className="text-base font-bold text-ink">Connected Platforms & Skill Evidence</CardTitle>
              <CardDescription className="text-xs font-medium text-ink-muted">
                Link your developer & algorithmic accounts to automatically verify your real-world proof.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.keys(platformMeta) as Array<keyof ConnectedAccountsMap>).map((key) => {
              const meta = platformMeta[key];
              const acc = currentProfile.connectedAccounts[key];
              const Icon = meta.icon;

              return (
                <div
                  key={key}
                  className={`flex items-start justify-between p-4 rounded-xl border transition-all ${
                    acc.connected
                      ? "border-success/30 bg-success-soft text-ink"
                      : "border-border bg-surface-raised text-ink hover:border-border-strong"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        acc.connected
                          ? "bg-success-soft text-success border border-success/30"
                          : "bg-surface text-ink-muted border border-border"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-ink">{meta.name}</span>
                        {acc.connected && (
                          <span className="inline-flex items-center text-[10px] font-bold text-success gap-0.5">
                            <CheckCircle2 className="h-3 w-3" /> Connected
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-ink-muted mt-0.5 leading-snug font-medium">
                        {acc.connected && acc.handle
                          ? `@${acc.handle} · ${meta.telemetryText}`
                          : meta.description}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant={acc.connected ? "secondary" : "outline"}
                    size="sm"
                    className="text-xs h-7 px-2.5 font-bold shrink-0 ml-2"
                    onClick={() => handleConnectClick(key)}
                  >
                    {acc.connected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Connect Account Handle Dialog */}
      {connectingPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-ink">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <span className="text-xs font-bold text-ink">
                Connect {platformMeta[connectingPlatform].name}
              </span>
              <button
                onClick={() => setConnectingPlatform(null)}
                className="rounded p-1 text-ink-muted hover:bg-surface-raised hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3.5 space-y-3">
              <p className="text-xs text-ink-muted font-medium">
                Enter your profile handle on {platformMeta[connectingPlatform].name} to link telemetry:
              </p>
              <Input
                placeholder={platformMeta[connectingPlatform].placeholder}
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && confirmConnect()}
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setConnectingPlatform(null)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={confirmConnect} className="gap-1 font-bold text-white bg-accent">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verify & Connect
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
