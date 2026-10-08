"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Layers, ArrowRight, CheckCircle2, ShieldCheck, X } from "lucide-react";
import { Input, Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRole, Role } from "@/context/role-context";
import { useUserProfile } from "@/context/user-profile-context";
import { LandingNav } from "@/components/shared/landing-nav";

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

export default function LoginPage() {
  const { setRole } = useRole();
  const { updateProfile, toggleConnectedAccount } = useUserProfile();
  const router = useRouter();
  
  const [role, setLocalRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRole(role);
    if (fullName || email) {
      updateProfile(role, {
        ...(fullName ? { name: fullName } : {}),
        ...(email ? { email } : {}),
      });
    }
    router.push(`/dashboard/${role}`);
  };

  const handleGoogleAuth = () => {
    setShowGoogleModal(true);
  };

  const confirmGoogleSignIn = (googleEmail: string, googleName: string) => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      setAuthSuccess(true);
      
      setTimeout(() => {
        setRole(role);
        updateProfile(role, {
          name: googleName,
          email: googleEmail,
        });
        toggleConnectedAccount(role, "google", googleEmail);
        setShowGoogleModal(false);
        router.push(`/dashboard/${role}`);
      }, 800);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-canvas">
      <LandingNav />
      <main className="flex items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center justify-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white">
              <Layers className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight text-ink">The Plug</span>
          </Link>

          <div className="auth-card rounded-2xl border p-6 shadow-card">
            <h1 className="text-lg font-semibold text-ink">Sign in to The Plug</h1>
            <p className="mt-1 text-xs text-ink-muted">Enter your credentials or authorize with Google.</p>

            <div className="mt-4">
              <Button
                type="button"
                variant="secondary"
                className="w-full flex items-center justify-center gap-2 border border-border hover:bg-surface-raised"
                onClick={handleGoogleAuth}
              >
                <GoogleIcon className="h-4 w-4" />
                <span>Continue with Google</span>
              </Button>
            </div>

            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-border" />
              <span className="absolute bg-surface px-2 text-[10px] uppercase tracking-wider text-ink-faint">
                Or sign in with email
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">Full Name</label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  Institutional Email
                </label>
                <Input
                  type="email"
                  placeholder="you@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">Sign in as</label>
                <Select value={role} onChange={(e) => setLocalRole(e.target.value as Role)}>
                  <option value="student">Student</option>
                  <option value="industry">Recruiter</option>
                  <option value="institution">Placement Cell</option>
                  <option value="faculty">Mentor</option>
                </Select>
              </div>
              <Button type="submit" className="w-full mt-2">
                Sign in
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>

          <p className="mt-4 text-center text-xs text-ink-muted">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-accent hover:underline">
              Register now
            </Link>
          </p>
        </div>
      </main>

      {/* Google OAuth Simulation Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <GoogleIcon className="h-5 w-5" />
                <span className="text-sm font-semibold text-ink">Sign in with Google (Demo)</span>
              </div>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="rounded p-1 text-ink-faint hover:bg-surface-raised hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isAuthenticating ? (
              <div className="py-10 text-center space-y-3">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                <p className="text-sm text-ink font-medium">Authorizing with Google (Demo Sign-in)...</p>
                <p className="text-xs text-ink-faint">Verifying demo credentials & permissions</p>
              </div>
            ) : authSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
                <p className="text-sm font-semibold text-ink">Google Authorization Verified (Demo)</p>
                <p className="text-xs text-ink-muted">Redirecting to your dashboard...</p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <p className="text-xs text-ink-muted">
                  Choose a demo Google profile to sign in to The Plug:
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => confirmGoogleSignIn("alex.dev@gmail.com", "Alex Mercer")}
                    className="w-full flex items-center justify-between rounded-lg border border-border p-3 text-left transition hover:border-accent/50 hover:bg-surface-raised"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-xs">
                        AM
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-ink">Alex Mercer</div>
                        <div className="text-[11px] text-ink-muted">alex.dev@gmail.com</div>
                      </div>
                    </div>
                    <ShieldCheck className="h-4 w-4 text-accent" />
                  </button>

                  <button
                    onClick={() => confirmGoogleSignIn("prof.animesh@university.edu", "Dr. Animesh Roy")}
                    className="w-full flex items-center justify-between rounded-lg border border-border p-3 text-left transition hover:border-accent/50 hover:bg-surface-raised"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-semibold text-xs">
                        AR
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-ink">Dr. Animesh Roy</div>
                        <div className="text-[11px] text-ink-muted">prof.animesh@university.edu</div>
                      </div>
                    </div>
                    <ShieldCheck className="h-4 w-4 text-accent" />
                  </button>

                  <button
                    onClick={() => confirmGoogleSignIn("recruiter@techcorp.io", "Sarah TechCorp")}
                    className="w-full flex items-center justify-between rounded-lg border border-border p-3 text-left transition hover:border-accent/50 hover:bg-surface-raised"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-600 font-semibold text-xs">
                        ST
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-ink">Sarah Recruiter</div>
                        <div className="text-[11px] text-ink-muted">recruiter@techcorp.io</div>
                      </div>
                    </div>
                    <ShieldCheck className="h-4 w-4 text-accent" />
                  </button>

                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
