"use client";

import { useState } from "react";
import type { components } from "@/lib/ai/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  UserCheck,
  Plus,
  X,
  Code2,
  FolderGit2,
  Award,
  Sparkles,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

export type Student = components["schemas"]["Student"];
export type Branch = components["schemas"]["Branch"];
export type Project = components["schemas"]["Project"];

export const BRANCH_OPTIONS: Branch[] = ["CSE", "IT", "ECE", "EEE", "ME", "CE", "OTHER"];

interface StudentProfileFormProps {
  initialStudent: Student;
  onSaveAndAnalyze: (student: Student) => void;
  isLoading: boolean;
  validationError: string | null;
}

export function StudentProfileForm({
  initialStudent,
  onSaveAndAnalyze,
  isLoading,
  validationError,
}: StudentProfileFormProps) {
  const [studentId, setStudentId] = useState(initialStudent.student_id);
  const [branch, setBranch] = useState<Branch>(initialStudent.branch);
  const [cgpa, setCgpa] = useState<string>(initialStudent.cgpa.toString());
  const [backlogs, setBacklogs] = useState<string>(initialStudent.backlogs.toString());
  const [gradYear, setGradYear] = useState<string>(initialStudent.graduation_year.toString());

  // Skills
  const [skills, setSkills] = useState<string[]>(initialStudent.skills ?? []);
  const [newSkillInput, setNewSkillInput] = useState("");

  // Certifications
  const [certifications, setCertifications] = useState<string[]>(
    initialStudent.certifications ?? []
  );
  const [newCertInput, setNewCertInput] = useState("");

  // Projects
  const [projects, setProjects] = useState<Project[]>(initialStudent.projects ?? []);
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjTech, setNewProjTech] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");

  // Assessment Scores (optional: null when empty, never 0)
  const [aptitudeScore, setAptitudeScore] = useState<string>(
    initialStudent.aptitude_score !== null && initialStudent.aptitude_score !== undefined
      ? initialStudent.aptitude_score.toString()
      : ""
  );
  const [commScore, setCommScore] = useState<string>(
    initialStudent.communication_score !== null && initialStudent.communication_score !== undefined
      ? initialStudent.communication_score.toString()
      : ""
  );
  const [mockScore, setMockScore] = useState<string>(
    initialStudent.mock_interview_score !== null && initialStudent.mock_interview_score !== undefined
      ? initialStudent.mock_interview_score.toString()
      : ""
  );

  const [localError, setLocalError] = useState<string | null>(null);

  // Skill tag add/remove
  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Certification add/remove
  const handleAddCert = () => {
    const trimmed = newCertInput.trim();
    if (trimmed && !certifications.includes(trimmed)) {
      setCertifications([...certifications, trimmed]);
      setNewCertInput("");
    }
  };

  const handleRemoveCert = (certToRemove: string) => {
    setCertifications(certifications.filter((c) => c !== certToRemove));
  };

  // Project add/remove
  const handleAddProject = () => {
    if (!newProjTitle.trim()) {
      setLocalError("Project title is required to add a project.");
      return;
    }
    const techArray = newProjTech
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newProject: Project = {
      title: newProjTitle.trim(),
      tech: techArray,
      description: newProjDesc.trim() || null,
    };

    setProjects([...projects, newProject]);
    setNewProjTitle("");
    setNewProjTech("");
    setNewProjDesc("");
    setLocalError(null);
  };

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  // Discard unsaved edits
  const handleResetToDefault = () => {
    setStudentId(initialStudent.student_id);
    setBranch(initialStudent.branch);
    setCgpa(initialStudent.cgpa.toString());
    setBacklogs(initialStudent.backlogs.toString());
    setGradYear(initialStudent.graduation_year.toString());
    setSkills(initialStudent.skills ?? []);
    setCertifications(initialStudent.certifications ?? []);
    setProjects(initialStudent.projects ?? []);
    setAptitudeScore(
      initialStudent.aptitude_score !== null && initialStudent.aptitude_score !== undefined
        ? initialStudent.aptitude_score.toString()
        : ""
    );
    setCommScore(
      initialStudent.communication_score !== null && initialStudent.communication_score !== undefined
        ? initialStudent.communication_score.toString()
        : ""
    );
    setMockScore(
      initialStudent.mock_interview_score !== null && initialStudent.mock_interview_score !== undefined
        ? initialStudent.mock_interview_score.toString()
        : ""
    );
    setLocalError(null);
  };

  // Submit & Validate
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // 1. CGPA Validation
    const parsedCgpa = parseFloat(cgpa);
    if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
      setLocalError("CGPA must be a valid number between 0.0 and 10.0.");
      return;
    }

    // 2. Backlogs Validation
    const parsedBacklogs = parseInt(backlogs, 10);
    if (isNaN(parsedBacklogs) || parsedBacklogs < 0) {
      setLocalError("Active backlogs must be 0 or a positive integer.");
      return;
    }

    // 3. Graduation Year Validation
    const parsedGradYear = parseInt(gradYear, 10);
    if (isNaN(parsedGradYear) || parsedGradYear < 2000 || parsedGradYear > 2040) {
      setLocalError("Graduation year must be between 2000 and 2040.");
      return;
    }

    // 4. Optional Assessment Scores: empty string must be null, never 0
    let parsedAptitude: number | null = null;
    if (aptitudeScore.trim() !== "") {
      const val = parseFloat(aptitudeScore);
      if (isNaN(val) || val < 0 || val > 100) {
        setLocalError("Aptitude score must be between 0 and 100 or left empty.");
        return;
      }
      parsedAptitude = val;
    }

    let parsedComm: number | null = null;
    if (commScore.trim() !== "") {
      const val = parseFloat(commScore);
      if (isNaN(val) || val < 0 || val > 100) {
        setLocalError("Communication score must be between 0 and 100 or left empty.");
        return;
      }
      parsedComm = val;
    }

    let parsedMock: number | null = null;
    if (mockScore.trim() !== "") {
      const val = parseFloat(mockScore);
      if (isNaN(val) || val < 0 || val > 100) {
        setLocalError("Mock interview score must be between 0 and 100 or left empty.");
        return;
      }
      parsedMock = val;
    }

    // Construct valid student matching contract
    const validatedStudent: Student = {
      student_id: studentId || "ST001",
      branch,
      cgpa: parsedCgpa,
      backlogs: parsedBacklogs,
      graduation_year: parsedGradYear,
      skills,
      certifications,
      projects,
      aptitude_score: parsedAptitude,
      communication_score: parsedComm,
      mock_interview_score: parsedMock,
      is_synthetic: false, // Explicit contract requirement
    };

    onSaveAndAnalyze(validatedStudent);
  };

  const displayedError = localError || validationError;

  return (
    <Card className="border-border bg-surface shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-ink flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-accent" />
              Edit your profile
            </CardTitle>
            <CardDescription className="text-xs text-ink-muted">
              Keep your academics, skills and projects up to date. Saving refreshes your readiness and skill gaps.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetToDefault}
            className="text-xs text-ink-muted hover:text-ink gap-1 self-start sm:self-auto"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Discard changes
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {displayedError && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Please fix this before saving</p>
              <p className="mt-0.5">{displayedError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Student ID & Branch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Student ID
              </label>
              <Input
                value={studentId}
                readOnly
                aria-readonly="true"
                className="text-xs font-mono opacity-70"
              />
              <span className="text-[11px] text-ink-muted mt-1 block">
                Assigned by your institution
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Branch
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value as Branch)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {BRANCH_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b} — {b === "CSE" ? "Computer Science & Engineering" : b === "IT" ? "Information Technology" : b === "ECE" ? "Electronics & Communication" : b === "EEE" ? "Electrical & Electronics" : b === "ME" ? "Mechanical Engineering" : b === "CE" ? "Civil Engineering" : "Other Specialization"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: CGPA, Backlogs, Graduation Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                CGPA (0.0 to 10.0)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                placeholder="8.2"
                required
                className="text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Active Backlogs
              </label>
              <Input
                type="number"
                step="1"
                min="0"
                value={backlogs}
                onChange={(e) => setBacklogs(e.target.value)}
                placeholder="0"
                required
                className="text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Graduation Year
              </label>
              <Input
                type="number"
                step="1"
                min="2000"
                max="2040"
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value)}
                placeholder="2027"
                required
                className="text-xs font-mono"
              />
            </div>
          </div>

          {/* Row 3: Skills Tag Input */}
          <div className="rounded-lg border border-border/80 bg-surface-raised/20 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                <Code2 className="h-4 w-4 text-accent" />
                Technical Skills (Tag Input)
              </label>
              <span className="text-[11px] text-ink-muted">
                {skills.length} skills listed
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2.5 min-h-[32px] p-2 rounded-md border border-border bg-surface">
              {skills.length === 0 ? (
                <span className="text-xs text-ink-muted italic">No skills added yet.</span>
              ) : (
                skills.map((skill) => (
                  <Badge
                    key={skill}
                    tone="accent"
                    className="gap-1 px-2.5 py-1 text-xs font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-white/80 focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Type a skill (e.g. AWS, Redis, TypeScript) and press Enter"
                className="text-xs flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSkill}
                className="text-xs shrink-0 gap-1 border-border"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Skill
              </Button>
            </div>
          </div>

          {/* Row 4: Certifications Tag Input */}
          <div className="rounded-lg border border-border/80 bg-surface-raised/20 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                <Award className="h-4 w-4 text-accent" />
                Certifications
              </label>
              <span className="text-[11px] text-ink-muted">
                {certifications.length} certifications
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2.5 min-h-[32px] p-2 rounded-md border border-border bg-surface">
              {certifications.length === 0 ? (
                <span className="text-xs text-ink-muted italic">No certifications added.</span>
              ) : (
                certifications.map((cert) => (
                  <Badge
                    key={cert}
                    tone="neutral"
                    className="gap-1 px-2.5 py-1 text-xs font-medium"
                  >
                    {cert}
                    <button
                      type="button"
                      onClick={() => handleRemoveCert(cert)}
                      className="hover:opacity-75 focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={newCertInput}
                onChange={(e) => setNewCertInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCert();
                  }
                }}
                placeholder="Add certification (e.g. AWS Certified Cloud Practitioner)"
                className="text-xs flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCert}
                className="text-xs shrink-0 gap-1 border-border"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Cert
              </Button>
            </div>
          </div>

          {/* Row 5: Projects List */}
          <div className="rounded-lg border border-border/80 bg-surface-raised/20 p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                <FolderGit2 className="h-4 w-4 text-accent" />
                Projects (title, tech, description)
              </label>
              <span className="text-[11px] text-ink-muted">
                {projects.length} projects
              </span>
            </div>

            {/* Existing Projects */}
            <div className="space-y-2 mb-3">
              {projects.length === 0 ? (
                <p className="text-xs text-ink-muted italic p-2">No projects added yet.</p>
              ) : (
                projects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface p-3"
                  >
                    <div className="space-y-1 text-xs flex-1">
                      <p className="font-bold text-ink">{proj.title}</p>
                      {proj.description && (
                        <p className="text-ink-muted text-[11px]">{proj.description}</p>
                      )}
                      {proj.tech && proj.tech.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {proj.tech.map((t) => (
                            <span
                              key={t}
                              className="rounded bg-surface-raised px-1.5 py-0.5 text-[10px] font-mono text-ink-muted border border-border"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveProject(idx)}
                      className="h-7 w-7 p-0 text-danger hover:bg-danger/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Add Project Sub-form */}
            <div className="space-y-2 rounded-lg border border-border/60 bg-surface/50 p-2.5">
              <p className="text-[11px] font-bold text-ink">Add New Project</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  value={newProjTitle}
                  onChange={(e) => setNewProjTitle(e.target.value)}
                  placeholder="Project Title (e.g. Library API)"
                  className="text-xs"
                />
                <Input
                  value={newProjTech}
                  onChange={(e) => setNewProjTech(e.target.value)}
                  placeholder="Tech Stack comma-separated (e.g. Python, FastAPI, SQL)"
                  className="text-xs"
                />
              </div>
              <Input
                value={newProjDesc}
                onChange={(e) => setNewProjDesc(e.target.value)}
                placeholder="Short Description (e.g. REST backend for a college library system)"
                className="text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddProject}
                className="text-xs gap-1 border-border w-full sm:w-auto"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Project to Profile
              </Button>
            </div>
          </div>

          {/* Row 6: Assessment Scores (Optional: empty = null, never 0) */}
          <div className="rounded-lg border border-border/80 bg-surface-raised/20 p-3.5">
            <div className="mb-2">
              <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-accent" />
                Assessment Scores (Optional — Empty field is sent as null, never 0)
              </label>
              <p className="text-[11px] text-ink-muted mt-0.5">
                Leave blank if not taken. If empty, the AI engine redistributes weight over remaining components.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-ink-muted mb-1">
                  Aptitude Score (0-100)
                </label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={aptitudeScore}
                  onChange={(e) => setAptitudeScore(e.target.value)}
                  placeholder="e.g. 72 or leave blank"
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ink-muted mb-1">
                  Communication Score (0-100)
                </label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={commScore}
                  onChange={(e) => setCommScore(e.target.value)}
                  placeholder="e.g. 65 or leave blank"
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ink-muted mb-1">
                  Mock Interview Score (0-100)
                </label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={mockScore}
                  onChange={(e) => setMockScore(e.target.value)}
                  placeholder="Leave blank if not taken"
                  className="text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-[11px] text-ink-muted">
              Saving updates your readiness score and skill gaps.
            </p>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto bg-accent text-white font-bold text-xs shadow-sm hover:opacity-95"
            >
              {isLoading ? "Updating your insights..." : "Save profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
