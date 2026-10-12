"use client";

import React, { useState } from "react";
import {
  StudentResume,
  ResumeSkill,
  Education,
  Project,
  Experience,
  Certification,
  Achievement,
  Leadership,
  SkillProficiency,
  ResumeVisibility,
} from "@/lib/api/resumes";
import { skills as catalogSkills, Skill } from "@/data/skills";
import {
  Plus,
  Trash2,
  UserCircle,
  FileText,
  GraduationCap,
  Wrench,
  FolderGit2,
  Briefcase,
  Award,
  Trophy,
  Users,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ResumeFormProps {
  resume: StudentResume;
  onChange: (updated: StudentResume) => void;
}

export function ResumeForm({ resume, onChange }: ResumeFormProps) {
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [skillSearch, setSkillSearch] = useState("");
  const [selectedProficiency, setSelectedProficiency] = useState<SkillProficiency>("Intermediate");

  // Helper updater
  const updatePersonalInfo = (field: string, value: string) => {
    onChange({
      ...resume,
      personalInfo: {
        ...resume.personalInfo,
        [field]: value,
      },
    });
  };

  const updateSummary = (val: string) => {
    onChange({ ...resume, summary: val });
  };

  // Education handlers
  const addEducation = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startYear: "2024",
      endYear: "2028",
      score: "",
    };
    onChange({ ...resume, education: [...resume.education, newEdu] });
  };

  const updateEducation = (index: number, field: keyof Education, val: string) => {
    const updated = [...resume.education];
    updated[index] = { ...updated[index], [field]: val };
    onChange({ ...resume, education: updated });
  };

  const removeEducation = (id: string) => {
    onChange({ ...resume, education: resume.education.filter((e) => e.id !== id) });
  };

  // Skill handlers
  const availableSkills = catalogSkills.filter(
    (cs) =>
      !resume.skills.some((rs) => rs.skillId === cs.id) &&
      cs.name.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const addSkill = (skill: Skill) => {
    const newResumeSkill: ResumeSkill = {
      skillId: skill.id,
      name: skill.name,
      category: skill.category,
      proficiency: selectedProficiency,
    };
    onChange({ ...resume, skills: [...resume.skills, newResumeSkill] });
    setSkillSearch("");
  };

  const removeSkill = (skillId: string) => {
    onChange({ ...resume, skills: resume.skills.filter((s) => s.skillId !== skillId) });
  };

  const updateSkillProficiency = (skillId: string, prof: SkillProficiency) => {
    onChange({
      ...resume,
      skills: resume.skills.map((s) =>
        s.skillId === skillId ? { ...s, proficiency: prof } : s
      ),
    });
  };

  // Project handlers
  const addProject = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: "",
      description: "",
      skillsUsed: [],
      githubUrl: "",
      liveDemoUrl: "",
      role: "",
    };
    onChange({ ...resume, projects: [...resume.projects, newProj] });
  };

  const updateProject = (index: number, field: keyof Project, val: any) => {
    const updated = [...resume.projects];
    updated[index] = { ...updated[index], [field]: val };
    onChange({ ...resume, projects: updated });
  };

  const removeProject = (id: string) => {
    onChange({ ...resume, projects: resume.projects.filter((p) => p.id !== id) });
  };

  // Experience handlers
  const addExperience = () => {
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      organization: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      description: "",
    };
    onChange({ ...resume, experience: [...resume.experience, newExp] });
  };

  const updateExperience = (index: number, field: keyof Experience, val: any) => {
    const updated = [...resume.experience];
    updated[index] = { ...updated[index], [field]: val };
    onChange({ ...resume, experience: updated });
  };

  const removeExperience = (id: string) => {
    onChange({ ...resume, experience: resume.experience.filter((e) => e.id !== id) });
  };

  // Certifications handlers
  const addCertification = () => {
    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      name: "",
      issuer: "",
      issueDate: "",
      credentialUrl: "",
    };
    onChange({ ...resume, certifications: [...resume.certifications, newCert] });
  };

  const updateCertification = (index: number, field: keyof Certification, val: string) => {
    const updated = [...resume.certifications];
    updated[index] = { ...updated[index], [field]: val };
    onChange({ ...resume, certifications: updated });
  };

  const removeCertification = (id: string) => {
    onChange({ ...resume, certifications: resume.certifications.filter((c) => c.id !== id) });
  };

  // Achievement handlers
  const addAchievement = () => {
    const newAch: Achievement = {
      id: `ach-${Date.now()}`,
      title: "",
      description: "",
      date: "",
    };
    onChange({ ...resume, achievements: [...resume.achievements, newAch] });
  };

  const updateAchievement = (index: number, field: keyof Achievement, val: string) => {
    const updated = [...resume.achievements];
    updated[index] = { ...updated[index], [field]: val };
    onChange({ ...resume, achievements: updated });
  };

  const removeAchievement = (id: string) => {
    onChange({ ...resume, achievements: resume.achievements.filter((a) => a.id !== id) });
  };

  // Leadership handlers
  const addLeadership = () => {
    const newLead: Leadership = {
      id: `lead-${Date.now()}`,
      organization: "",
      position: "",
      description: "",
      duration: "",
    };
    onChange({ ...resume, leadership: [...resume.leadership, newLead] });
  };

  const updateLeadership = (index: number, field: keyof Leadership, val: string) => {
    const updated = [...resume.leadership];
    updated[index] = { ...updated[index], [field]: val };
    onChange({ ...resume, leadership: updated });
  };

  const removeLeadership = (id: string) => {
    onChange({ ...resume, leadership: resume.leadership.filter((l) => l.id !== id) });
  };

  // Visibility handler
  const updateVisibility = (key: keyof ResumeVisibility, val: boolean) => {
    onChange({
      ...resume,
      visibility: {
        ...resume.visibility,
        [key]: val,
      },
    });
  };

  const sections = [
    { id: "personal", label: "Personal Info", icon: UserCircle },
    { id: "summary", label: "Summary", icon: FileText },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "skills", label: "Skills", icon: Wrench },
    { id: "projects", label: "Projects", icon: FolderGit2 },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "certifications", label: "Certifications", icon: Award },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "leadership", label: "Leadership", icon: Users },
    { id: "privacy", label: "Privacy & Access", icon: Lock },
  ];

  return (
    <div className="space-y-4">
      {/* Section Navigation Tabs */}
      <div className="flex overflow-x-auto gap-1 border-b border-border pb-2 scrollbar-thin">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeTab === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveTab(sec.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors shrink-0",
                isActive
                  ? "bg-accent-soft text-accent border border-accent/30 shadow-sm"
                  : "text-ink-muted hover:text-ink hover:bg-surface-raised"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", isActive ? "text-accent" : "text-ink-muted")} />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= 1. PERSONAL INFORMATION ================= */}
      {activeTab === "personal" && (
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 space-y-4 shadow-sm text-ink">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <UserCircle className="h-4 w-4 text-accent" />
              Personal Information
            </h3>
            <span className="text-[11px] text-ink-muted font-medium">Structured Profile Data</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-ink">Full Name *</label>
              <Input
                value={resume.personalInfo.fullName}
                onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                placeholder="Rudy Sharma"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink">Professional Headline *</label>
              <Input
                value={resume.personalInfo.headline}
                onChange={(e) => updatePersonalInfo("headline", e.target.value)}
                placeholder="Computer Science Student | Backend & Cloud Enthusiast"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink">Email Address *</label>
              <Input
                value={resume.personalInfo.email}
                onChange={(e) => updatePersonalInfo("email", e.target.value)}
                placeholder="rudy.sharma@example.edu"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink">Phone Number</label>
              <Input
                value={resume.personalInfo.phone}
                onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                placeholder="+91 98765 43210"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink">Location</label>
              <Input
                value={resume.personalInfo.location}
                onChange={(e) => updatePersonalInfo("location", e.target.value)}
                placeholder="Rourkela, Odisha, India"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink">LinkedIn URL</label>
              <Input
                value={resume.personalInfo.linkedinUrl}
                onChange={(e) => updatePersonalInfo("linkedinUrl", e.target.value)}
                placeholder="linkedin.com/in/rudysharma-dev"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink">GitHub URL</label>
              <Input
                value={resume.personalInfo.githubUrl}
                onChange={(e) => updatePersonalInfo("githubUrl", e.target.value)}
                placeholder="github.com/rudysharma"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink">Portfolio / Website URL</label>
              <Input
                value={resume.personalInfo.portfolioUrl}
                onChange={(e) => updatePersonalInfo("portfolioUrl", e.target.value)}
                placeholder="rudysharma.dev"
                className="mt-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. PROFESSIONAL SUMMARY ================= */}
      {activeTab === "summary" && (
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 space-y-3 shadow-sm text-ink">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent" />
              Professional Summary
            </h3>
            <span
              className={cn(
                "text-[11px] font-bold px-2 py-0.5 rounded border",
                resume.summary.length >= 300 && resume.summary.length <= 500
                  ? "bg-success-soft text-success border-success/30"
                  : "bg-surface-raised text-ink-muted border-border"
              )}
            >
              {resume.summary.length} characters (Recommended: 300–500)
            </span>
          </div>

          <Textarea
            value={resume.summary}
            onChange={(e) => updateSummary(e.target.value)}
            rows={5}
            placeholder="Write a concise overview of your technical background, core skills, key academic projects, and career aspirations..."
          />
          <p className="text-[11px] text-ink-muted italic font-medium">
            Tip: Highlight your technical stack, domain focus, and key accomplishments concisely for recruiters.
          </p>
        </div>
      )}

      {/* ================= 3. EDUCATION ================= */}
      {activeTab === "education" && (
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 space-y-4 shadow-sm text-ink">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-accent" />
              Education History
            </h3>
            <Button
              onClick={addEducation}
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 border-accent/30 text-accent hover:bg-accent-soft"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Education
            </Button>
          </div>

          {resume.education.map((edu, idx) => (
            <div
              key={edu.id}
              className="rounded-lg border border-border bg-surface-raised p-3.5 space-y-3 relative group"
            >
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="text-xs font-bold text-ink">
                  Education #{idx + 1}
                </span>
                <button
                  onClick={() => removeEducation(edu.id)}
                  className="text-ink-muted hover:text-danger transition-colors p-1"
                  title="Remove Education"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-ink-muted">Institution Name</label>
                  <Input
                    value={edu.institution}
                    onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                    placeholder="e.g. National Institute of Technology"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink-muted">Degree</label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                    placeholder="e.g. B.Tech"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink-muted">Field of Study</label>
                  <Input
                    value={edu.fieldOfStudy}
                    onChange={(e) => updateEducation(idx, "fieldOfStudy", e.target.value)}
                    placeholder="e.g. Computer Science and Engineering"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-ink-muted">Start</label>
                    <Input
                      value={edu.startYear}
                      onChange={(e) => updateEducation(idx, "startYear", e.target.value)}
                      placeholder="2024"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-ink-muted">End / Grad</label>
                    <Input
                      value={edu.endYear}
                      onChange={(e) => updateEducation(idx, "endYear", e.target.value)}
                      placeholder="2028"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-ink-muted">Score / CGPA</label>
                    <Input
                      value={edu.score}
                      onChange={(e) => updateEducation(idx, "score", e.target.value)}
                      placeholder="8.8 CGPA"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= 4. TECHNICAL SKILLS ================= */}
      {activeTab === "skills" && (
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 space-y-4 shadow-sm text-ink">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <Wrench className="h-4 w-4 text-accent" />
              Technical Skills (Skill Intelligence System)
            </h3>
            <span className="text-[11px] text-ink-muted font-medium">Uses CampusLink Shared Skill Model</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-ink">Selected Resume Skills ({resume.skills.length})</label>
            <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-surface-raised border border-border min-h-[50px]">
              {resume.skills.map((skill) => (
                <div
                  key={skill.skillId}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface border border-border text-xs text-ink shadow-sm"
                >
                  <span className="font-bold text-ink">{skill.name}</span>
                  <Select
                    value={skill.proficiency}
                    onChange={(e) =>
                      updateSkillProficiency(skill.skillId, e.target.value as SkillProficiency)
                    }
                    className="h-6 text-[10px] bg-surface-raised border-border text-accent font-bold py-0 px-1"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </Select>
                  <button
                    onClick={() => removeSkill(skill.skillId)}
                    className="text-ink-muted hover:text-danger transition-colors ml-1 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface-raised p-3 space-y-3">
            <label className="text-xs font-bold text-ink">Search & Add Skills from Skill Intelligence Catalog</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                placeholder="Type to search skills (e.g. Python, Docker, PostgreSQL)..."
              />
              <Select
                value={selectedProficiency}
                onChange={(e) => setSelectedProficiency(e.target.value as SkillProficiency)}
                className="h-9 text-xs font-semibold w-full sm:w-36"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </Select>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto scrollbar-thin pt-1">
              {availableSkills.slice(0, 15).map((cs) => (
                <button
                  key={cs.id}
                  onClick={() => addSkill(cs)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface hover:bg-accent-soft text-ink hover:text-accent text-xs border border-border font-medium transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  <span>{cs.name}</span>
                  <span className="text-[10px] text-ink-muted font-mono">({cs.category})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. PROJECTS ================= */}
      {activeTab === "projects" && (
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 space-y-4 shadow-sm text-ink">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <FolderGit2 className="h-4 w-4 text-accent" />
              Key Projects
            </h3>
            <Button
              onClick={addProject}
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 border-accent/30 text-accent hover:bg-accent-soft"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Project
            </Button>
          </div>

          {resume.projects.map((proj, idx) => (
            <div key={proj.id} className="rounded-lg border border-border bg-surface-raised p-3.5 space-y-3">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="text-xs font-bold text-ink">Project #{idx + 1}</span>
                <button
                  onClick={() => removeProject(proj.id)}
                  className="text-ink-muted hover:text-danger transition-colors p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-ink-muted">Project Name *</label>
                  <Input
                    value={proj.title}
                    onChange={(e) => updateProject(idx, "title", e.target.value)}
                    placeholder="e.g. Campus Management System"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink-muted">Project Role</label>
                  <Input
                    value={proj.role || ""}
                    onChange={(e) => updateProject(idx, "role", e.target.value)}
                    placeholder="e.g. Lead Backend Developer"
                    className="mt-1"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-ink-muted">Short Description</label>
                  <Textarea
                    value={proj.description}
                    onChange={(e) => updateProject(idx, "description", e.target.value)}
                    rows={2}
                    placeholder="Built a web-based campus portal for managing student records using Python, FastAPI, PostgreSQL..."
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink-muted">GitHub Repository URL</label>
                  <Input
                    value={proj.githubUrl || ""}
                    onChange={(e) => updateProject(idx, "githubUrl", e.target.value)}
                    placeholder="https://github.com/..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink-muted">Live Demo URL</label>
                  <Input
                    value={proj.liveDemoUrl || ""}
                    onChange={(e) => updateProject(idx, "liveDemoUrl", e.target.value)}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= 6. EXPERIENCE ================= */}
      {activeTab === "experience" && (
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 space-y-4 shadow-sm text-ink">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-accent" />
              Work Experience / Internships
            </h3>
            <Button
              onClick={addExperience}
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 border-accent/30 text-accent hover:bg-accent-soft"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Experience
            </Button>
          </div>

          {resume.experience.map((exp, idx) => (
            <div key={exp.id} className="rounded-lg border border-border bg-surface-raised p-3.5 space-y-3">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="text-xs font-bold text-ink">Experience #{idx + 1}</span>
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="text-ink-muted hover:text-danger transition-colors p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-ink-muted">Organization / Company *</label>
                  <Input
                    value={exp.organization}
                    onChange={(e) => updateExperience(idx, "organization", e.target.value)}
                    placeholder="e.g. TechNova Solutions"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink-muted">Role / Position *</label>
                  <Input
                    value={exp.role}
                    onChange={(e) => updateExperience(idx, "role", e.target.value)}
                    placeholder="e.g. Software Engineering Intern"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink-muted">Location</label>
                  <Input
                    value={exp.location}
                    onChange={(e) => updateExperience(idx, "location", e.target.value)}
                    placeholder="e.g. Bhubaneswar, Odisha"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-ink-muted">Start Date</label>
                    <Input
                      value={exp.startDate}
                      onChange={(e) => updateExperience(idx, "startDate", e.target.value)}
                      placeholder="May 2025"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-ink-muted">End Date</label>
                    <Input
                      disabled={exp.currentlyWorking}
                      value={exp.endDate}
                      onChange={(e) => updateExperience(idx, "endDate", e.target.value)}
                      placeholder="July 2025"
                      className="mt-1 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`exp-curr-${exp.id}`}
                    checked={exp.currentlyWorking}
                    onChange={(e) => updateExperience(idx, "currentlyWorking", e.target.checked)}
                    className="rounded border-border text-accent focus:ring-accent"
                  />
                  <label htmlFor={`exp-curr-${exp.id}`} className="text-xs font-semibold text-ink">
                    I currently work here
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-ink-muted">Bullet Points / Key Contributions</label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(idx, "description", e.target.value)}
                    rows={3}
                    placeholder="• Developed backend APIs in Python & FastAPI&#10;• Optimized PostgreSQL query performance..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= 7. CERTIFICATIONS ================= */}
      {activeTab === "certifications" && (
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 space-y-4 shadow-sm text-ink">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <Award className="h-4 w-4 text-accent" />
              Certifications & Badges
            </h3>
            <Button
              onClick={addCertification}
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 border-accent/30 text-accent hover:bg-accent-soft"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Certification
            </Button>
          </div>

          {resume.certifications.map((cert, idx) => (
            <div key={cert.id} className="rounded-lg border border-border bg-surface-raised p-3.5 space-y-3">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="text-xs font-bold text-ink">Certification #{idx + 1}</span>
                <button
                  onClick={() => removeCertification(cert.id)}
                  className="text-ink-muted hover:text-danger transition-colors p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-ink-muted">Certification Name</label>
                  <Input
                    value={cert.name}
                    onChange={(e) => updateCertification(idx, "name", e.target.value)}
                    placeholder="AWS Certified Cloud Practitioner"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink-muted">Issuing Organization</label>
                  <Input
                    value={cert.issuer}
                    onChange={(e) => updateCertification(idx, "issuer", e.target.value)}
                    placeholder="Amazon Web Services"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink-muted">Issue Date</label>
                  <Input
                    value={cert.issueDate}
                    onChange={(e) => updateCertification(idx, "issueDate", e.target.value)}
                    placeholder="Jan 2025"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink-muted">Credential URL</label>
                  <Input
                    value={cert.credentialUrl || ""}
                    onChange={(e) => updateCertification(idx, "credentialUrl", e.target.value)}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= 8. ACHIEVEMENTS ================= */}
      {activeTab === "achievements" && (
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 space-y-4 shadow-sm text-ink">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <Trophy className="h-4 w-4 text-accent" />
              Achievements & Competitions
            </h3>
            <Button
              onClick={addAchievement}
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 border-accent/30 text-accent hover:bg-accent-soft"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Achievement
            </Button>
          </div>

          {resume.achievements.map((ach, idx) => (
            <div key={ach.id} className="rounded-lg border border-border bg-surface-raised p-3.5 space-y-3">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="text-xs font-bold text-ink">Achievement #{idx + 1}</span>
                <button
                  onClick={() => removeAchievement(ach.id)}
                  className="text-ink-muted hover:text-danger transition-colors p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-ink-muted">Title</label>
                  <Input
                    value={ach.title}
                    onChange={(e) => updateAchievement(idx, "title", e.target.value)}
                    placeholder="Winner — Smart India Hackathon"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink-muted">Date</label>
                  <Input
                    value={ach.date}
                    onChange={(e) => updateAchievement(idx, "date", e.target.value)}
                    placeholder="Oct 2025"
                    className="mt-1"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-ink-muted">Description</label>
                  <Input
                    value={ach.description}
                    onChange={(e) => updateAchievement(idx, "description", e.target.value)}
                    placeholder="Secured 1st rank among 45 student teams..."
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= 9. LEADERSHIP ================= */}
      {activeTab === "leadership" && (
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 space-y-4 shadow-sm text-ink">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <Users className="h-4 w-4 text-accent" />
              Leadership & Extracurricular
            </h3>
            <Button
              onClick={addLeadership}
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 border-accent/30 text-accent hover:bg-accent-soft"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Leadership Role
            </Button>
          </div>

          {resume.leadership.map((item, idx) => (
            <div key={item.id} className="rounded-lg border border-border bg-surface-raised p-3.5 space-y-3">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="text-xs font-bold text-ink">Leadership #{idx + 1}</span>
                <button
                  onClick={() => removeLeadership(item.id)}
                  className="text-ink-muted hover:text-danger transition-colors p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-ink-muted">Organization / Club</label>
                  <Input
                    value={item.organization}
                    onChange={(e) => updateLeadership(idx, "organization", e.target.value)}
                    placeholder="Coding Club, NIT Rourkela"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink-muted">Position / Title</label>
                  <Input
                    value={item.position}
                    onChange={(e) => updateLeadership(idx, "position", e.target.value)}
                    placeholder="Technical Coordinator"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink-muted">Duration</label>
                  <Input
                    value={item.duration}
                    onChange={(e) => updateLeadership(idx, "duration", e.target.value)}
                    placeholder="Aug 2025 - Present"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink-muted">Description</label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateLeadership(idx, "description", e.target.value)}
                    placeholder="Organized competitive programming workshops..."
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= 10. PRIVACY & ACCESS CONTROL ================= */}
      {activeTab === "privacy" && (
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 space-y-4 shadow-sm text-ink">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <Lock className="h-4 w-4 text-accent" />
                Resume Visibility & Privacy Controls
              </h3>
              <p className="text-xs text-ink-muted mt-0.5 font-medium">
                Control exactly which authorized stakeholders on CampusLink can access your resume.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-bold text-success border border-success/30">
              <CheckCircle2 className="h-3 w-3" />
              Private by Default
            </span>
          </div>

          <div className="space-y-3 bg-surface-raised p-4 rounded-lg border border-border">
            <h4 className="text-xs font-bold text-ink">Who can view your resume?</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2.5 p-2.5 rounded border border-border bg-surface hover:bg-surface-raised cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={resume.visibility.faculty}
                  onChange={(e) => updateVisibility("faculty", e.target.checked)}
                  className="rounded border-border text-accent focus:ring-accent"
                />
                <div className="text-xs">
                  <div className="font-bold text-ink">Faculty Mentors</div>
                  <div className="text-[11px] text-ink-muted">Verified academic department guides</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded border border-border bg-surface hover:bg-surface-raised cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={resume.visibility.industry}
                  onChange={(e) => updateVisibility("industry", e.target.checked)}
                  className="rounded border-border text-accent focus:ring-accent"
                />
                <div className="text-xs">
                  <div className="font-bold text-ink">Verified Industry Partners</div>
                  <div className="text-[11px] text-ink-muted">Companies with active job/internship posts</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded border border-border bg-surface hover:bg-surface-raised cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={resume.visibility.recruiters}
                  onChange={(e) => updateVisibility("recruiters", e.target.checked)}
                  className="rounded border-border text-accent focus:ring-accent"
                />
                <div className="text-xs">
                  <div className="font-bold text-ink">Campus Recruiters</div>
                  <div className="text-[11px] text-ink-muted">Authorized technical recruiters evaluating applications</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded border border-border bg-surface opacity-60 cursor-not-allowed">
                <input
                  type="checkbox"
                  disabled
                  checked={false}
                  className="rounded border-border text-ink-muted cursor-not-allowed"
                />
                <div className="text-xs">
                  <div className="font-bold text-ink-muted">Public Internet (Disabled)</div>
                  <div className="text-[11px] text-ink-faint">Resumes are never indexed or publicly searchable</div>
                </div>
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface-raised p-4 space-y-2">
            <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              Who can see your resume?
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded bg-surface border border-border text-ink font-semibold flex items-center gap-1.5">
                <span className="text-success">✓</span> You (Student)
              </div>
              <div className="p-2 rounded bg-surface border border-border text-ink font-semibold flex items-center gap-1.5">
                <span className={resume.visibility.faculty ? "text-success" : "text-danger"}>
                  {resume.visibility.faculty ? "✓" : "✗"}
                </span>{" "}
                Faculty
              </div>
              <div className="p-2 rounded bg-surface border border-border text-ink font-semibold flex items-center gap-1.5">
                <span className={resume.visibility.industry ? "text-success" : "text-danger"}>
                  {resume.visibility.industry ? "✓" : "✗"}
                </span>{" "}
                Verified Industry
              </div>
              <div className="p-2 rounded bg-surface border border-border text-ink font-semibold flex items-center gap-1.5">
                <span className={resume.visibility.recruiters ? "text-success" : "text-danger"}>
                  {resume.visibility.recruiters ? "✓" : "✗"}
                </span>{" "}
                Recruiters
              </div>
            </div>
            <p className="text-[11px] text-ink-muted pt-1 italic font-medium">
              * Your resume is not publicly searchable. Other students on CampusLink cannot view your resume.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
