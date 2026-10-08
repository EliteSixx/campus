"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  FileText,
  GraduationCap,
  Landmark,
  Layers,
  BookOpen,
  ShieldCheck,
  X,
  Upload,
} from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/select";
import { useRole, type Role } from "@/context/role-context";
import { useUserProfile } from "@/context/user-profile-context";

type FormState = {
  // Step 1: Identity
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  dob: string;
  country: string;
  state: string;
  city: string;
  address: string;

  // Step 2: Role Metrics
  role: Role;
  // Student
  studentInstitution: string;
  studentDepartment: string;
  academicYear: string;
  graduationYear: string;
  professionalDomain: string;
  // Industry
  companyName: string;
  companyWebsite: string;
  primaryDomain: string;
  roleDesignation: string;
  hiringFocus: string;
  // Institution
  institutionName: string;
  institutionType: string;
  institutionDepartment: string;
  institutionLocation: string;
  // Faculty
  facultyInstitution: string;
  facultyDepartment: string;
  highestQualification: string;
  yearsOfExperience: string;
  researchDomain: string;

  // Step 3: Dossier
  resume: File | null;
  resumeName: string;
  isFresher: boolean;
  certifications: string;
  techStack: string;
  portfolioLink: string;
  linkedInProfile: string;
  pastExperience: string;
  openJobsLink: string;
  talentAcquisitionExperience: string;
  publicationsLink: string;
  grantsAwards: string;

  // Step 4: Credentials
  password: string;
  confirmPassword: string;
};

const initialForm: FormState = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  dob: "",
  country: "India",
  state: "",
  city: "",
  address: "",

  role: "student",
  studentInstitution: "",
  studentDepartment: "",
  academicYear: "3rd Year",
  graduationYear: "2026",

  professionalDomain: "Software Engineering",

  companyName: "",
  companyWebsite: "",
  primaryDomain: "Cloud & Infrastructure",
  roleDesignation: "",
  hiringFocus: "Full-time & Internships",

  institutionName: "",
  institutionType: "University",
  institutionDepartment: "",
  institutionLocation: "",

  facultyInstitution: "",
  facultyDepartment: "",
  highestQualification: "Ph.D",
  yearsOfExperience: "5+ Years",
  researchDomain: "",

  resume: null,
  resumeName: "",
  isFresher: true,
  certifications: "",
  techStack: "",
  portfolioLink: "",
  linkedInProfile: "",
  pastExperience: "",
  openJobsLink: "",
  talentAcquisitionExperience: "",
  publicationsLink: "",
  grantsAwards: "",

  password: "",
  confirmPassword: "",
};

const roleOptions: Array<{
  value: Role;
  label: string;
  subtitle: string;
  icon: typeof GraduationCap;
}> = [
  { value: "student", label: "Student", subtitle: "Building verified skills", icon: GraduationCap },
  { value: "industry", label: "Recruiter", subtitle: "Hiring & live demand", icon: Building2 },
  { value: "institution", label: "Placement Cell", subtitle: "Cohort diagnostics", icon: Landmark },
  { value: "faculty", label: "Mentor", subtitle: "Student placement guidance", icon: BookOpen },
];

const stepMeta = [
  { title: "Identity", subtitle: "Personal Profile" },
  { title: "Role Metrics", subtitle: "Context & Credentials" },
  { title: "Dossier", subtitle: "Experience & CV" },
  { title: "Credentials", subtitle: "Password Setup" },
];

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

export default function RegisterPage() {
  const router = useRouter();
  const { setRole } = useRole();
  const { updateProfile, toggleConnectedAccount } = useUserProfile();

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Google Modal State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isAuthenticatingGoogle, setIsAuthenticatingGoogle] = useState(false);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      resume: file,
      resumeName: file ? file.name : "",
    }));
  };

  const validateCurrentStep = (): boolean => {
    setError(null);
    if (step === 0) {
      if (!formData.firstName.trim()) {
        setError("First name is required.");
        return false;
      }
      if (!formData.lastName.trim()) {
        setError("Last name is required.");
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes("@")) {
        setError("Please enter a valid email address.");
        return false;
      }
      return true;
    }

    if (step === 1) {
      if (formData.role === "student") {
        if (!formData.studentInstitution.trim()) {
          setError("Please specify your institution.");
          return false;
        }
      } else if (formData.role === "industry") {
        if (!formData.companyName.trim()) {
          setError("Company name is required.");
          return false;
        }
      } else if (formData.role === "institution") {
        if (!formData.institutionName.trim()) {
          setError("Institution name is required.");
          return false;
        }
      } else if (formData.role === "faculty") {
        if (!formData.facultyInstitution.trim()) {
          setError("Institution name is required.");
          return false;
        }
      }
      return true;
    }

    if (step === 2) {
      // Dossier is optional/recommended in prototype mode
      return true;
    }

    if (step === 3) {
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep((prev) => Math.min(prev + 1, stepMeta.length - 1));
    }
  };

  const handlePrev = () => {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleGoogleSelect = (mockEmail: string, mockFirst: string, mockLast: string) => {
    setIsAuthenticatingGoogle(true);
    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        firstName: mockFirst,
        lastName: mockLast,
        email: mockEmail,
      }));
      toggleConnectedAccount(formData.role, "google", mockEmail);
      setIsAuthenticatingGoogle(false);
      setShowGoogleModal(false);
      // Advance to Step 2 so user can configure their role metrics
      setStep(1);
    }, 600);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);

    try {
      // Try calling API if configured (gracefully ignored in prototype mode)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (apiUrl) {
        try {
          await fetch(`${apiUrl}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });
        } catch {
          // Prototype fallback
        }
      }

      // Persist to canonical client state
      const targetRole = formData.role;
      setRole(targetRole);

      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      let yearOrTitle = "";
      let department = "";

      if (targetRole === "student") {
        yearOrTitle = `${formData.academicYear} · Class of ${formData.graduationYear}`;
        department = formData.studentDepartment || "Computer Science";
      } else if (targetRole === "industry") {
        yearOrTitle = formData.roleDesignation || "Talent Acquisition Lead";
        department = formData.companyName || "Industry Partner";
      } else if (targetRole === "institution") {
        yearOrTitle = "Institutional Administrator";
        department = formData.institutionName || "CUPGS Odisha";
      } else if (targetRole === "faculty") {
        yearOrTitle = formData.highestQualification ? `${formData.highestQualification} · Mentor` : "Mentor";
        department = formData.facultyDepartment || "Computer Science";
      }

      updateProfile(targetRole, {
        name: fullName,
        email: formData.email,
        department,
        yearOrTitle,
        bio: formData.pastExperience || `${fullName} - ${yearOrTitle}`,
      });

      // Save prototype session tokens
      localStorage.setItem("theplug_auth_user", JSON.stringify({ name: fullName, role: targetRole, email: formData.email }));

      router.push(`/dashboard/${targetRole}`);
    } catch {
      setError("Failed to complete registration. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-border bg-surface/80 backdrop-blur px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white shadow-sm">
            <Layers className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-ink">The Plug</span>
            <span className="text-[9px] text-ink-muted uppercase tracking-wider font-bold">Onboarding</span>
          </div>
        </Link>
        <div className="text-xs text-ink-muted flex items-center gap-1.5">
          <span>Already registered?</span>
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Multi-Step Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-2xl">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-mono text-ink-muted mb-2">
              <span className="text-accent font-bold uppercase tracking-wider">
                STEP {step + 1} OF {stepMeta.length} // {stepMeta[step].title}
              </span>
              <span>{Math.round(((step + 1) / stepMeta.length) * 100)}% Complete</span>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full rounded-full bg-surface-raised overflow-hidden border border-border">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${((step + 1) / stepMeta.length) * 100}%` }}
              />
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              {stepMeta.map((s, idx) => (
                <div
                  key={s.title}
                  className={`text-left transition-colors ${
                    idx === step
                      ? "text-accent font-bold"
                      : idx < step
                      ? "text-ink font-medium"
                      : "text-ink-faint"
                  }`}
                >
                  <p className="text-[11px] uppercase tracking-wider truncate">{idx + 1}. {s.title}</p>
                  <p className="text-[9px] text-ink-muted hidden sm:block truncate">{s.subtitle}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="auth-card rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xl">
            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-error/30 bg-error-soft/40 p-3 text-xs text-error">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {/* ========================================================================= */}
                {/* STEP 1: IDENTITY                                                          */}
                {/* ========================================================================= */}
                {step === 0 && (
                  <motion.div
                    key="step-0"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <h2 className="text-lg font-bold text-ink">Personal Profile</h2>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Tell us who you are. This establishes your verified identity across the platform.
                      </p>
                    </div>

                    {/* Google Signup Button */}
                    <div className="pt-1">
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full flex items-center justify-center gap-2.5 border border-border bg-surface-raised hover:bg-surface-raised/80 py-2.5"
                        onClick={() => setShowGoogleModal(true)}
                      >
                        <GoogleIcon className="h-4 w-4" />
                        <span className="text-xs font-semibold text-ink">Sign up with Google</span>
                      </Button>
                    </div>

                    <div className="relative my-3 flex items-center justify-center">
                      <div className="w-full border-t border-border" />
                      <span className="absolute bg-surface px-3 text-[10px] uppercase font-mono tracking-wider text-ink-faint">
                        Or enter information manually
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-ink-muted">First Name *</label>
                        <Input
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="e.g. Alex"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-ink-muted">Middle Name</label>
                        <Input
                          name="middleName"
                          value={formData.middleName}
                          onChange={handleInputChange}
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-ink-muted">Last Name *</label>
                        <Input
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="e.g. Johnson"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-ink-muted">Email Address *</label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="alex@university.edu"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-ink-muted">Date of Birth</label>
                        <Input
                          name="dob"
                          type="date"
                          value={formData.dob}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-ink-muted">Country</label>
                        <Input
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="India"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-ink-muted">State / Region</label>
                        <Input
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="Odisha"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-ink-muted">City</label>
                        <Input
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Bhubaneswar"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-ink-muted">Address / Campus</label>
                      <Input
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Campus 3, Technology Corridor"
                      />
                    </div>
                  </motion.div>
                )}

                {/* ========================================================================= */}
                {/* STEP 2: ROLE METRICS                                                      */}
                {/* ========================================================================= */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="text-lg font-bold text-ink">What best describes you?</h2>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Select your primary platform role to configure the relevant telemetry and metrics.
                      </p>
                    </div>

                    {/* Role Selection Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {roleOptions.map((r) => {
                        const Icon = r.icon;
                        const isSelected = formData.role === r.value;
                        return (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, role: r.value }))}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 ${
                              isSelected
                                ? "border-accent bg-accent-soft text-accent ring-2 ring-accent/30 shadow-sm"
                                : "border-border bg-surface hover:bg-surface-raised text-ink-muted hover:text-ink"
                            }`}
                          >
                            <Icon className={`h-5 w-5 mb-1.5 ${isSelected ? "text-accent" : "text-ink-muted"}`} />
                            <span className="text-xs font-bold leading-tight">{r.label}</span>
                            <span className="text-[9px] text-ink-muted mt-0.5 leading-tight hidden sm:block">{r.subtitle}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Role-Specific Metric Fields */}
                    <div className="rounded-xl border border-border bg-surface-raised/40 p-4 space-y-3">
                      <p className="text-xs font-bold text-accent uppercase tracking-wider font-mono">
                        // {formData.role.toUpperCase()} CONTEXT & ATTRIBUTES
                      </p>

                      {formData.role === "student" && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-ink-muted">Institution *</label>
                              <Input
                                name="studentInstitution"
                                value={formData.studentInstitution}
                                onChange={handleInputChange}
                                placeholder="e.g. CUPGS Odisha / NIT Rourkela"
                                required
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-ink-muted">Department / Branch</label>
                              <Input
                                name="studentDepartment"
                                value={formData.studentDepartment}
                                onChange={handleInputChange}
                                placeholder="e.g. Computer Science & Eng"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-ink-muted">Current Academic Year</label>
                              <Select name="academicYear" value={formData.academicYear} onChange={handleInputChange}>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="Final Year">Final Year</option>
                                <option value="Postgraduate">Postgraduate</option>
                              </Select>
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-ink-muted">Graduation Year</label>
                              <Select name="graduationYear" value={formData.graduationYear} onChange={handleInputChange}>
                                {["2025", "2026", "2027", "2028", "2029"].map((y) => (
                                  <option key={y} value={y}>{y}</option>
                                ))}
                              </Select>
                            </div>
                          </div>
                        </div>
                      )}

                      {formData.role === "industry" && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-ink-muted">Company Name *</label>
                              <Input
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleInputChange}
                                placeholder="e.g. CloudScale Technologies"
                                required
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-ink-muted">Company Website</label>
                              <Input
                                name="companyWebsite"
                                value={formData.companyWebsite}
                                onChange={handleInputChange}
                                placeholder="https://cloudscale.io"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-ink-muted">Primary Domain</label>
                              <Select name="primaryDomain" value={formData.primaryDomain} onChange={handleInputChange}>
                                <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                                <option value="AI & Machine Learning">AI & Machine Learning</option>
                                <option value="Fintech & Banking">Fintech & Banking</option>
                                <option value="Cybersecurity">Cybersecurity</option>
                                <option value="Semiconductors & VLSI">Semiconductors & VLSI</option>
                              </Select>
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-ink-muted">Your Designation</label>
                              <Input
                                name="roleDesignation"
                                value={formData.roleDesignation}
                                onChange={handleInputChange}
                                placeholder="e.g. Head of Talent Acquisition"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {formData.role === "institution" && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-ink-muted">Institution Name *</label>
                              <Input
                                name="institutionName"
                                value={formData.institutionName}
                                onChange={handleInputChange}
                                placeholder="e.g. CUPGS Odisha"
                                required
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-ink-muted">Institution Type</label>
                              <Select name="institutionType" value={formData.institutionType} onChange={handleInputChange}>
                                <option value="State University">State University</option>
                                <option value="National Institute (IIT/NIT)">National Institute (IIT/NIT)</option>
                                <option value="Autonomous Engineering College">Autonomous Engineering College</option>
                                <option value="Private University">Private University</option>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-ink-muted">Lead Department / Cell</label>
                              <Input
                                name="institutionDepartment"
                                value={formData.institutionDepartment}
                                onChange={handleInputChange}
                                placeholder="e.g. Training & Placement Cell"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-ink-muted">Location / Campus</label>
                              <Input
                                name="institutionLocation"
                                value={formData.institutionLocation}
                                onChange={handleInputChange}
                                placeholder="e.g. Bhubaneswar, Odisha"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {formData.role === "faculty" && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-ink-muted">Affiliated Institution *</label>
                              <Input
                                name="facultyInstitution"
                                value={formData.facultyInstitution}
                                onChange={handleInputChange}
                                placeholder="e.g. CUPGS Odisha"
                                required
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-ink-muted">Department</label>
                              <Input
                                name="facultyDepartment"
                                value={formData.facultyDepartment}
                                onChange={handleInputChange}
                                placeholder="e.g. Computer Science & Eng"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-ink-muted">Highest Qualification</label>
                              <Select name="highestQualification" value={formData.highestQualification} onChange={handleInputChange}>
                                <option value="Ph.D">Ph.D</option>
                                <option value="M.Tech / M.E">M.Tech / M.E</option>
                                <option value="Post-Doc">Post-Doc</option>
                                <option value="M.S">M.S</option>
                              </Select>
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-ink-muted">Teaching Experience</label>
                              <Select name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleInputChange}>
                                <option value="1-3 Years">1-3 Years</option>
                                <option value="3-5 Years">3-5 Years</option>
                                <option value="5-10 Years">5-10 Years</option>
                                <option value="10+ Years">10+ Years</option>
                              </Select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ========================================================================= */}
                {/* STEP 3: DOSSIER                                                           */}
                {/* ========================================================================= */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <h2 className="text-lg font-bold text-ink">Professional Dossier</h2>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Provide your career artifacts, resume, certifications, and public profiles.
                      </p>
                    </div>

                    {/* Resume / CV File Upload Section */}
                    {(formData.role === "student" || formData.role === "faculty") && (
                      <div className="rounded-xl border border-dashed border-border bg-surface-raised/50 p-4 text-center">
                        <Upload className="h-6 w-6 text-accent mx-auto mb-1.5" />
                        <p className="text-xs font-bold text-ink">
                          {formData.resumeName ? formData.resumeName : "Upload Resume / Curriculum Vitae"}
                        </p>
                        <p className="text-[11px] text-ink-muted mt-0.5">PDF or DOCX up to 10MB</p>
                        <label className="mt-2.5 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-accent/40 bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent-soft/80 transition-colors">
                          <span>Browse File</span>
                          <input
                            type="file"
                            accept=".pdf,.docx,.doc"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}

                    {/* Student Specific Dossier */}
                    {formData.role === "student" && (
                      <div className="space-y-3">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-ink-muted">Key Tech Stack / Languages</label>
                          <Input
                            name="techStack"
                            value={formData.techStack}
                            onChange={handleInputChange}
                            placeholder="e.g. Python, React, PostgreSQL, Docker"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-ink-muted">Certifications</label>
                          <Input
                            name="certifications"
                            value={formData.certifications}
                            onChange={handleInputChange}
                            placeholder="e.g. AWS Certified Cloud Practitioner"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-ink-muted">Portfolio / GitHub Link</label>
                            <Input
                              name="portfolioLink"
                              value={formData.portfolioLink}
                              onChange={handleInputChange}
                              placeholder="https://github.com/username"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-ink-muted">LinkedIn Profile</label>
                            <Input
                              name="linkedInProfile"
                              value={formData.linkedInProfile}
                              onChange={handleInputChange}
                              placeholder="https://linkedin.com/in/username"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Industry Specific Dossier */}
                    {formData.role === "industry" && (
                      <div className="space-y-3">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-ink-muted">Talent Acquisition Experience</label>
                          <Input
                            name="talentAcquisitionExperience"
                            value={formData.talentAcquisitionExperience}
                            onChange={handleInputChange}
                            placeholder="e.g. 6+ years hiring tech & engineering talent"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-ink-muted">Open Jobs / Careers Portal</label>
                            <Input
                              name="openJobsLink"
                              value={formData.openJobsLink}
                              onChange={handleInputChange}
                              placeholder="https://company.com/careers"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-ink-muted">Company LinkedIn Page</label>
                            <Input
                              name="linkedInProfile"
                              value={formData.linkedInProfile}
                              onChange={handleInputChange}
                              placeholder="https://linkedin.com/company/profile"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Institution Specific Dossier */}
                    {formData.role === "institution" && (
                      <div className="space-y-3">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-ink-muted">Accreditation & Recognitions</label>
                          <Input
                            name="certifications"
                            value={formData.certifications}
                            onChange={handleInputChange}
                            placeholder="e.g. NAAC A++, NBA Accredited Programs"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-ink-muted">Institutional Portal URL</label>
                          <Input
                            name="portfolioLink"
                            value={formData.portfolioLink}
                            onChange={handleInputChange}
                            placeholder="https://institution.edu.in"
                          />
                        </div>
                      </div>
                    )}

                    {/* Mentor Specific Dossier */}
                    {formData.role === "faculty" && (
                      <div className="space-y-3">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-ink-muted">Research Domain / Specialization</label>
                          <Input
                            name="researchDomain"
                            value={formData.researchDomain}
                            onChange={handleInputChange}
                            placeholder="e.g. High Performance Computing & Deep Learning"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-ink-muted">Google Scholar / Publications Link</label>
                            <Input
                              name="publicationsLink"
                              value={formData.publicationsLink}
                              onChange={handleInputChange}
                              placeholder="https://scholar.google.com/citations?user=..."
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-ink-muted">Grants & Key Awards</label>
                            <Input
                              name="grantsAwards"
                              value={formData.grantsAwards}
                              onChange={handleInputChange}
                              placeholder="e.g. DST-SERB Research Grant 2024"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ========================================================================= */}
                {/* STEP 4: CREDENTIALS                                                       */}
                {/* ========================================================================= */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <h2 className="text-lg font-bold text-ink">Set Your Security Password</h2>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Create a strong password to protect your account and telemetry profile.
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-ink-muted">Password (min 8 chars) *</label>
                        <Input
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••••••"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-ink-muted">Confirm Password *</label>
                        <Input
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="••••••••••••"
                          required
                        />
                      </div>
                    </div>

                    {/* Summary confirmation box */}
                    <div className="rounded-xl border border-accent/20 bg-accent-soft/30 p-4 mt-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-accent">
                        <BadgeCheck className="h-4 w-4 text-accent" />
                        <span>Ready to initialize {formData.role.toUpperCase()} profile</span>
                      </div>
                      <p className="text-[11px] text-ink-muted mt-1">
                        Registering as <strong className="text-ink">{formData.firstName} {formData.lastName}</strong> ({formData.email}) with automatic telemetry mapping.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Actions */}
              <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
                {step > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrev}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Previous</span>
                  </Button>
                ) : (
                  <div />
                )}

                {step < stepMeta.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <span>Next</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 text-xs font-bold"
                  >
                    <span>{isSubmitting ? "Creating Account..." : "Create Account"}</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Google Mock Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <GoogleIcon className="h-4 w-4" />
                <span className="text-xs font-bold text-ink">Sign in with Google</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="text-ink-muted hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-ink-muted my-3">
              Select a demo account to pre-fill your identity and proceed with role setup:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                disabled={isAuthenticatingGoogle}
                onClick={() => handleGoogleSelect("alex.johnson@university.edu", "Alex", "Johnson")}
                className="w-full text-left p-2.5 rounded-xl border border-border bg-surface-raised/40 hover:bg-surface-raised flex items-center gap-3 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-xs">
                  AJ
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-ink truncate">Alex Johnson</p>
                  <p className="text-[10px] text-ink-muted truncate">alex.johnson@university.edu</p>
                </div>
              </button>

              <button
                type="button"
                disabled={isAuthenticatingGoogle}
                onClick={() => handleGoogleSelect("elena.rostova@techcorp.io", "Elena", "Rostova")}
                className="w-full text-left p-2.5 rounded-xl border border-border bg-surface-raised/40 hover:bg-surface-raised flex items-center gap-3 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs">
                  ER
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-ink truncate">Elena Rostova</p>
                  <p className="text-[10px] text-ink-muted truncate">elena.rostova@techcorp.io</p>
                </div>
              </button>
            </div>

            {isAuthenticatingGoogle && (
              <div className="mt-3 text-center text-xs text-accent font-semibold animate-pulse">
                Pre-filling identity profile...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-4 px-4 text-center text-xs text-ink-muted">
        <span>The Plug · Smart India Hackathon MVP · Canonical 5-Role Registration</span>
      </footer>
    </div>
  );
}
