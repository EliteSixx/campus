"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, CheckCircle2, ChevronRight, Clapperboard, Film, Search, Sparkles, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, Input, Textarea } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { students } from "@/data/students";
import { getSkillById } from "@/data/skills";

const startupSkills = ["python", "react", "nodejs", "aws", "postgresql", "networking"];

type PostMode = "text" | "video";

type JobForm = {
  role: string;
  description: string;
  experienceRequired: string;
  skill: string;
};

export function IndustryPostJobClient() {
  const router = useRouter();
  const [mode, setMode] = useState<PostMode>("text");
  const [job, setJob] = useState<JobForm>({
    role: "",
    description: "",
    experienceRequired: "",
    skill: "python",
  });
  const [videoDescription, setVideoDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [query, setQuery] = useState("");

  const mvpStudents = useMemo(() => {
    const selectedSkill = job.skill || "python";
    const keyword = query.trim().toLowerCase();
    return students
      .filter((student) => {
        const score = student.skills.find((item) => item.skillId === selectedSkill)?.score ?? 0;
        const matchesSkill = score >= 55;
        const matchesQuery =
          keyword === "" || student.name.toLowerCase().includes(keyword) || student.careerGoal.toLowerCase().includes(keyword);
        return matchesSkill && matchesQuery;
      })
      .sort((a, b) => {
        const scoreA = a.skills.find((item) => item.skillId === selectedSkill)?.score ?? 0;
        const scoreB = b.skills.find((item) => item.skillId === selectedSkill)?.score ?? 0;
        return scoreB - scoreA;
      })
      .slice(0, 4);
  }, [job.skill, query]);

  const recommendedSkill = getSkillById(job.skill ?? "python")?.name ?? "Python";

  function postTextJob(event: FormEvent) {
    event.preventDefault();
    router.push("/dashboard/industry?jobPosted=true");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[22px] border border-border bg-surface p-6 shadow-[0_20px_60px_-30px_rgba(217,148,56,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-ink-muted">Recruitment Workspace</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-ink">Post a Job</h2>
            <p className="mt-2 max-w-xl text-xs font-medium text-ink-muted">
              Create a role, brief a video, and shortlist the strongest students by verified skill fit.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode("text")}
              className={`rounded-full border px-4 py-2 text-xs font-black transition ${
                mode === "text" ? "border-accent bg-accent text-white" : "border-border bg-surface text-ink-muted hover:text-ink"
              }`}
            >
              <span className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5" />Text</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("video")}
              className={`rounded-full border px-4 py-2 text-xs font-black transition ${
                mode === "video" ? "border-accent bg-accent text-white" : "border-border bg-surface text-ink-muted hover:text-ink"
              }`}
            >
              <span className="flex items-center gap-2"><Film className="h-3.5 w-3.5" />Video</span>
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(460px,1.2fr)_minmax(280px,0.8fr)]">
        <Card className="border border-border">
          <CardHeader>
            <div>
              <CardTitle>{mode === "text" ? "Role Brief" : "Video Brief"}</CardTitle>
              <CardDescription>
                {mode === "text" ? "Capture role requirements and fit signal." : "Share a role video and describe the opportunity."}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {mode === "text" ? (
              <form className="space-y-4" onSubmit={postTextJob}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.14em] text-ink-muted">Role</label>
                    <Input
                      placeholder="Data Scientist"
                      value={job.role}
                      onChange={(event) => setJob({ ...job, role: event.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.14em] text-ink-muted">Skill focus</label>
                    <Select value={job.skill} onChange={(event) => setJob({ ...job, skill: event.target.value })}>
                      {startupSkills.map((skill) => (
                        <option key={skill} value={skill}>{getSkillById(skill)?.name}</option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.14em] text-ink-muted">Description</label>
                  <Textarea
                    rows={5}
                    placeholder="Share business context, team expectations, and delivery goals."
                    value={job.description}
                    onChange={(event) => setJob({ ...job, description: event.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.14em] text-ink-muted">Experience required</label>
                  <Input
                    placeholder="0-2 years / 2+ years / internship-ready"
                    value={job.experienceRequired}
                    onChange={(event) => setJob({ ...job, experienceRequired: event.target.value })}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" size="md">
                    <Sparkles className="h-4 w-4" />
                    Publish Job
                  </Button>
                  <Button variant="outline" size="md">
                    Save Draft
                  </Button>
                </div>
              </form>
            ) : (
              <form
                className="space-y-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!videoFile) {
                    return;
                  }

                  const uploadData = new FormData();
                  uploadData.append("file", videoFile);

                  try {
                    const response = await fetch("/api/imagekit/upload", {
                      method: "POST",
                      body: uploadData,
                    });

                    if (!response.ok) {
                      const payload = await response.json();
                      console.error(payload.error ?? "ImageKit upload failed.");
                      return;
                    }

                    const payload = await response.json();
                    console.log("Uploaded to ImageKit", payload);
                  } catch (error) {
                    console.error(error);
                  }
                }}
              >
                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.14em] text-ink-muted">Video Description</label>
                  <Textarea
                    rows={4}
                    placeholder="Describe the role, expectations, and learning opportunity."
                    value={videoDescription}
                    onChange={(event) => setVideoDescription(event.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.14em] text-ink-muted">Video Upload</label>
                  <label className="flex min-h-[128px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#785b20] bg-surface p-4 text-center transition hover:bg-surface-raised">
                    <Film className="mb-2 h-8 w-8 text-accent" />
                    <span className="text-xs font-black text-ink">Drop or upload a video brief</span>
                    <span className="mt-1 text-[11px] text-ink-muted">
                      {videoFile ? videoFile.name : "MP4 / MOV / WebM"}
                    </span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.14em] text-ink-muted">Skill focus</label>
                  <Select value={job.skill} onChange={(event) => setJob({ ...job, skill: event.target.value })}>
                    {startupSkills.map((skill) => (
                      <option key={skill} value={skill}>{getSkillById(skill)?.name}</option>
                    ))}
                  </Select>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    onClick={() => {
                      router.push("/dashboard/industry?jobPosted=true");
                    }}
                  >
                    <Clapperboard className="h-4 w-4" />
                    Post Video Job
                  </Button>
                  <Button variant="outline" size="md">
                    Save as Draft
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>Suggested MVPs</CardTitle>
                <CardDescription>Students matched on {recommendedSkill}</CardDescription>
              </div>
              <Badge tone="accent">{mvpStudents.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
              <Input placeholder="Find student" className="pl-8" value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>

            <div className="space-y-3">
              {mvpStudents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-4 text-sm text-ink-muted">
                  No MVPs found for this skill.
                </div>
              ) : (
                mvpStudents.map((student) => {
                  const score = student.skills.find((item) => item.skillId === job.skill)?.score ?? 0;
                  return (
                    <div key={student.id} className="rounded-2xl border border-border bg-surface-raised p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-ink">{student.name}</span>
                            <Badge tone="success">{score}% skill</Badge>
                          </div>
                          <div className="mt-1 text-[11px] font-semibold text-ink-muted">
                            {student.department} ┬╖ {student.year}
                          </div>
                        </div>
                        <button className="rounded-full border border-border px-2 py-1 text-[10px] font-black text-accent hover:bg-accent hover:text-white">
                          <span className="flex items-center gap-1"><UserPlus className="h-3 w-3" />Give chance</span>
                        </button>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-border">
                          <div className="h-1.5 rounded-full bg-accent" style={{ width: `${Math.min(score, 100)}%` }} />
                        </div>
                        <span className="text-[11px] font-black text-ink-muted">{score}%</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-ink-muted">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                Candidate Fit
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-ink-muted">Recommended skill</div>
                  <div className="text-sm font-black text-ink">{recommendedSkill}</div>
                </div>
                <div className="flex items-center gap-1 text-accent">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-[11px] font-black">MVP Pipeline</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] font-bold text-ink-muted">Post-ready shortlist</span>
                <button className="text-[11px] font-black text-accent hover:underline">
                  <span className="flex items-center gap-1">Create shortlist <ChevronRight className="h-3 w-3" /></span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
