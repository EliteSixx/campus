"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowLeft, ArrowRight, BadgeCheck, Briefcase, Building2, CheckCircle2, FileText, GraduationCap, UserCircle2 } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/select";
import { LandingNav } from "@/components/shared/landing-nav";
import { useRole, type Role } from "@/context/role-context";

type RegistrationRole = "student" | "hirer" | "faculty" | "researcher";

type FormState = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  dob: string;
  country: string;
  state: string;
  city: string;
  address: string;
  role: RegistrationRole;
  secondary: string;
  seniorSecondary: string;
  graduation: string;
  postGraduation: string;
  phd: string;
  companyName: string;
  companyWebsite: string;
  primaryDomain: string;
  institution: string;
  department: string;
  highestQualification: string;
  resume: File | null;
  isFresher: boolean;
  pastCompany: string;
  experienceYears: string;
  certifications: string;
  techStack: string;
  portfolioLink: string;
  talentAcquisitionExperience: string;
  openJobsLink: string;
  linkedInProfile: string;
  yearsOfExperience: string;
  publicationsLink: string;
  grantsAwards: string;
  password: string;
  confirmPassword: string;
};

const roleOptions: Array<{ value: RegistrationRole; label: string; icon: typeof UserCircle2 }> = [
  { value: "student", label: "Student", icon: UserCircle2 },
  { value: "hirer", label: "Hirer", icon: Briefcase },
  { value: "faculty", label: "Faculty", icon: GraduationCap },
  { value: "researcher", label: "Researcher", icon: Building2 },
];

const stepMeta = [
  { title: "Identity", subtitle: "Basic profile" },
  { title: "Role Metrics", subtitle: "Context & credentials" },
  { title: "Dossier", subtitle: "Experience & resume" },
  { title: "Credentials", subtitle: "Password setup" },
];

const initialForm: FormState = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  dob: "",
  country: "",
  state: "",
  city: "",
  address: "",
  role: "student",
  secondary: "",
  seniorSecondary: "",
  graduation: "",
  postGraduation: "",
  phd: "",
  companyName: "",
  companyWebsite: "",
  primaryDomain: "",
  institution: "",
  department: "",
  highestQualification: "",
  resume: null,
  isFresher: true,
  pastCompany: "",
  experienceYears: "",
  certifications: "",
  techStack: "",
  portfolioLink: "",
  talentAcquisitionExperience: "",
  openJobsLink: "",
  linkedInProfile: "",
  yearsOfExperience: "",
  publicationsLink: "",
  grantsAwards: "",
  password: "",
  confirmPassword: "",
};

const roleMap: Record<RegistrationRole, Role> = {
  student: "student",
  hirer: "industry",
  faculty: "faculty",
  researcher: "faculty",
};

const fieldClass =
  "h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-medium text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 shadow-sm";

function TextInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  className,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label className={['block space-y-1.5', className].filter(Boolean).join(' ')}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
        {label}
        {required ? <span className="ml-1 text-accent">*</span> : null}
      </span>
      <Input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} className={fieldClass} disabled={disabled} />
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
        {label}
        {required ? <span className="ml-1 text-accent">*</span> : null}
      </span>
      <Select name={name} value={value} onChange={onChange} className={fieldClass}>
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </label>
  );
}

function TextareaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 4,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
        {label}
        {required ? <span className="ml-1 text-accent">*</span> : null}
      </span>
      <Textarea name={name} value={value} onChange={onChange} rows={rows} placeholder={placeholder} className={`${fieldClass} min-h-[120px]`} />
    </label>
  );
}

function FileUpload({
  label,
  name,
  file,
  onChange,
  required = false,
}: {
  label: string;
  name: string;
  file: File | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
        {label}
        {required ? <span className="ml-1 text-accent">*</span> : null}
      </span>
      <div className="rounded-xl border border-dashed border-border bg-surface p-3">
        <input type="file" name={name} onChange={onChange} className="block w-full text-sm text-ink file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white" />
        <p className="mt-2 text-xs text-ink-muted">{file ? file.name : "No file selected yet"}</p>
      </div>
    </label>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-3">
      <span className="text-sm font-medium text-ink">{label}</span>
      <button
        type="button"
        aria-pressed={checked}
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full border transition-all duration-200 ${checked ? "border-accent bg-accent/10" : "border-border bg-surface-raised"}`} 
      >
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ${checked ? "left-6 bg-accent" : "left-1 bg-ink-muted"}`} />
      </button>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { setRole } = useRole();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormState>(initialForm);
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = useMemo(() => (currentStep / stepMeta.length) * 100, [currentStep]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = event.target;
    const { name, value, type } = target;
    const nextValue = type === "file" ? (target as HTMLInputElement).files?.[0] ?? null : type === "checkbox" ? (target as HTMLInputElement).checked : value;

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const getRoleRequirements = (role: RegistrationRole) => {
    if (role === "student") {
      return [
        ["secondary", "Secondary (10th)"],
        ["seniorSecondary", "Senior Secondary (12th)"],
        ["graduation", "Graduation"],
      ];
    }

    if (role === "hirer") {
      return [
        ["companyName", "Company Name"],
        ["companyWebsite", "Company Website"],
        ["primaryDomain", "Primary Domain"],
      ];
    }

    return [
      ["institution", "Affiliated Institution / Lab"],
      ["department", "Department / Research Domain"],
      ["highestQualification", "Highest Qualification"],
    ];
  };

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      if (!formData.firstName.trim()) return "First name is required.";
      if (!formData.lastName.trim()) return "Last name is required.";
      if (!formData.email.trim()) return "Email is required.";
      if (!formData.dob) return "Date of birth is required.";
      if (!formData.country.trim()) return "Country is required.";
      if (!formData.state.trim()) return "State is required.";
      if (!formData.city.trim()) return "City is required.";
      if (!formData.address.trim()) return "Address is required.";
      return "";
    }

    if (currentStep === 2) {
      const requiredFields = getRoleRequirements(formData.role);
      for (const [key, label] of requiredFields) {
        const fieldValue = (formData as Record<string, unknown>)[key];
        if (typeof fieldValue !== "string" || !fieldValue.trim()) {
          return `${label} is required.`;
        }
      }
      return "";
    }

    if (currentStep === 3) {
      if (!formData.resume) return "A resume or CV upload is required.";
      if (formData.role === "student") {
        if (formData.isFresher === false && (!formData.pastCompany.trim() || !formData.experienceYears.trim())) {
          return "Past company and experience years are required for non-freshers.";
        }
      }
      if (formData.role === "hirer") {
        if (!formData.talentAcquisitionExperience.trim()) return "Talent acquisition experience is required.";
        if (!formData.openJobsLink.trim()) return "Open jobs link is required.";
        if (!formData.linkedInProfile.trim()) return "LinkedIn profile is required.";
      }
      if (formData.role === "faculty" || formData.role === "researcher") {
        if (!formData.yearsOfExperience.trim()) return "Years of experience is required.";
        if (!formData.publicationsLink.trim()) return "Publications or scholar link is required.";
        if (!formData.grantsAwards.trim()) return "Grants or awards details are required.";
      }
      return "";
    }

    if (!formData.password.trim()) return "Password is required.";
    if (!formData.confirmPassword.trim()) return "Please confirm your password.";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match.";
    if (formData.password.length < 8) return "Password must be at least 8 characters long.";
    return "";
  };

  const goToNextStep = () => {
    const validationMessage = validateCurrentStep();
    if (validationMessage) {
      setServerError(validationMessage);
      return;
    }

    setServerError("");
    setCurrentStep((prev) => Math.min(prev + 1, stepMeta.length));
  };

  const goToPrevStep = () => {
    setServerError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationMessage = validateCurrentStep();
    if (validationMessage) {
      setServerError(validationMessage);
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    setServerError("");
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") return;
        if (value instanceof File) {
          payload.append(key, value);
          return;
        }
        payload.append(key, String(value));
      });

      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message ?? "Signup failed. Please try again.");
      }

      const data = await response.json();
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", data.accessToken ?? "");
        localStorage.setItem("refreshToken", data.refreshToken ?? "");
        localStorage.setItem("user", JSON.stringify(data.user ?? { ...formData, resume: formData.resume?.name ?? null }));
      }

      setRole(roleMap[formData.role]);
      router.push("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected signup error.";
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const sharedInputWrapper = "grid gap-4 md:grid-cols-2";

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className={sharedInputWrapper}>
              <TextInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" required />
              <TextInput label="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} placeholder="Optional" />
            </div>
            <div className={sharedInputWrapper}>
              <TextInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" required />
              <TextInput label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="name@domain.com" required />
            </div>
            <div className={sharedInputWrapper}>
              <TextInput label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} required />
              <SelectField
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Select country"
                required
                options={[
                  { value: "india", label: "India" },
                  { value: "usa", label: "USA" },
                  { value: "germany", label: "Germany" },
                  { value: "uk", label: "United Kingdom" },
                ]}
              />
            </div>
            <div className={sharedInputWrapper}>
              <TextInput label="State" name="state" value={formData.state} onChange={handleChange} placeholder="State / Province" required />
              <TextInput label="City" name="city" value={formData.city} onChange={handleChange} placeholder="City" required />
            </div>
            <TextareaField label="Address" name="address" value={formData.address} onChange={handleChange} placeholder="Street, locality, landmark" required rows={4} />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Select Role</span>
              <div className="grid gap-3 sm:grid-cols-2">
                {roleOptions.map(({ value, label, icon: Icon }) => {
                  const active = formData.role === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, role: value }))}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                        active ? "border-accent bg-accent-soft text-accent" : "border-border bg-surface text-ink hover:border-accent/40"
                      }`}
                    >
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${active ? "bg-white text-accent" : "bg-surface-raised text-ink-muted"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{label}</div>
                        <div className="text-[11px] text-current/70">{value === "student" ? "Academic profile" : value === "hirer" ? "Hiring profile" : "Research profile"}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </label>

            {formData.role === "student" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <TextInput label="Secondary (10th)" name="secondary" value={formData.secondary} onChange={handleChange} placeholder="e.g. 88%" required />
                <TextInput label="Senior Secondary (12th)" name="seniorSecondary" value={formData.seniorSecondary} onChange={handleChange} placeholder="e.g. 92%" required />
                <TextInput label="Graduation" name="graduation" value={formData.graduation} onChange={handleChange} placeholder="e.g. B.Tech / B.A" required />
                <TextInput label="Post-Graduation (Optional)" name="postGraduation" value={formData.postGraduation} onChange={handleChange} placeholder="e.g. M.Tech" />
                <TextInput label="PhD (Optional)" name="phd" value={formData.phd} onChange={handleChange} placeholder="e.g. PhD in AI" className="md:col-span-2" />
              </div>
            ) : null}

            {formData.role === "hirer" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <TextInput label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Acme Labs" required />
                <TextInput label="Company Website" name="companyWebsite" value={formData.companyWebsite} onChange={handleChange} placeholder="https://example.com" required />
                <TextInput label="Primary Domain" name="primaryDomain" value={formData.primaryDomain} onChange={handleChange} placeholder="AI, Healthcare, SaaS" required className="md:col-span-2" />
              </div>
            ) : null}

            {(formData.role === "faculty" || formData.role === "researcher") ? (
              <div className="grid gap-4 md:grid-cols-2">
                <TextInput label="Affiliated Institution / Lab" name="institution" value={formData.institution} onChange={handleChange} placeholder="Institute / Lab name" required />
                <TextInput label="Department / Research Domain" name="department" value={formData.department} onChange={handleChange} placeholder="AI / Data Systems" required />
                <TextInput label="Highest Qualification" name="highestQualification" value={formData.highestQualification} onChange={handleChange} placeholder="PhD / M.Tech / Prof" required className="md:col-span-2" />
              </div>
            ) : null}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <FileUpload label="Resume / CV" name="resume" onChange={handleChange} file={formData.resume} required />

            {formData.role === "student" ? (
              <div className="space-y-4">
                <ToggleSwitch checked={formData.isFresher} onChange={() => setFormData((prev) => ({ ...prev, isFresher: !prev.isFresher }))} label="I am a fresher" />
                {!formData.isFresher ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextInput label="Past Company" name="pastCompany" value={formData.pastCompany} onChange={handleChange} placeholder="Company name" />
                    <TextInput label="Experience Years" name="experienceYears" value={formData.experienceYears} onChange={handleChange} placeholder="2.5" />
                  </div>
                ) : null}
                <div className="grid gap-4 md:grid-cols-2">
                  <TextInput label="Certifications" name="certifications" value={formData.certifications} onChange={handleChange} placeholder="AWS, Azure, etc." />
                  <TextInput label="Tech Stack" name="techStack" value={formData.techStack} onChange={handleChange} placeholder="React, Node, Python" />
                </div>
                <TextInput label="Portfolio Link" name="portfolioLink" value={formData.portfolioLink} onChange={handleChange} placeholder="https://portfolio.com" />
              </div>
            ) : null}

            {formData.role === "hirer" ? (
              <div className="space-y-4">
                <TextInput label="Talent Acquisition Experience" name="talentAcquisitionExperience" value={formData.talentAcquisitionExperience} onChange={handleChange} placeholder="5 years" required />
                <TextInput label="Open Jobs Link" name="openJobsLink" value={formData.openJobsLink} onChange={handleChange} placeholder="https://company.com/jobs" required />
                <TextInput label="LinkedIn Profile" name="linkedInProfile" value={formData.linkedInProfile} onChange={handleChange} placeholder="https://linkedin.com/in/your-profile" required />
              </div>
            ) : null}

            {(formData.role === "faculty" || formData.role === "researcher") ? (
              <div className="space-y-4">
                <TextInput label="Years of Experience" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} placeholder="8" required />
                <TextInput label="Publications / Google Scholar" name="publicationsLink" value={formData.publicationsLink} onChange={handleChange} placeholder="https://scholar.google.com" required />
                <TextareaField label="Grants / Awards" name="grantsAwards" value={formData.grantsAwards} onChange={handleChange} placeholder="List key grants, awards, or recognitions" required rows={4} />
              </div>
            ) : null}
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <TextInput label="Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Minimum 8 characters" required />
            <TextInput label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat your password" required />
            <div className="rounded-xl border border-border bg-surface-raised p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-ink">
                <BadgeCheck className="h-4 w-4 text-accent" />
                You are registering as <span className="font-semibold text-accent capitalize">{formData.role}</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <LandingNav />
      <main className="mx-auto max-w-5xl px-4 py-10 md:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4"> 
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Create profile</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Complete your registration</h1>
          </div>
          <Link href="/login" className="flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>

        <div className="rounded-[26px] border border-border bg-surface p-4 shadow-[0_20px_60px_-28px_rgba(15,12,9,0.24)] md:p-6">
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
              <span>Step {currentStep} of {stepMeta.length}</span>
              <span>{stepMeta[currentStep - 1].title}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-raised">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full rounded-full bg-accent"
              />
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-ink-muted">
              {stepMeta.map((step, index) => (
                <div key={step.title} className={`flex-1 rounded-lg border px-2 py-2 ${index + 1 === currentStep ? "border-accent/40 bg-accent-soft text-accent" : "border-border bg-surface"}`}>
                  <div className="font-semibold">{index + 1}. {step.title}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.14em] opacity-75">{step.subtitle}</div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="min-h-[360px]"
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>

            {serverError ? (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
              <button type="button" onClick={goToPrevStep} disabled={currentStep === 1} className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink-muted transition hover:border-border-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-40">
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>

              {currentStep < stepMeta.length ? (
                <Button type="button" onClick={goToNextStep} className="gap-2">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? "Submitting..." : "Create account"}
                  {!isSubmitting ? <CheckCircle2 className="h-4 w-4" /> : null}
                </Button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
