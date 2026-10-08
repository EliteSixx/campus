"use client";

import React from "react";
import { StudentResume, ResumeTemplate } from "@/lib/api/resumes";
import { cn } from "@/lib/utils";

interface ResumePreviewProps {
  resume: StudentResume;
  template?: ResumeTemplate;
  className?: string;
  zoom?: number; // scale factor
}

function formatUrl(url?: string) {
  if (!url || !url.trim()) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

export function ResumePreview({
  resume,
  template = "modern",
  className,
  zoom = 100,
}: ResumePreviewProps) {
  const activeTemplate = resume.template || template;
  const {
    personalInfo,
    summary,
    education,
    skills,
    projects,
    experience,
    certifications,
    achievements,
    leadership,
    coursework,
    languages,
    optionalSectionsConfig,
  } = resume;

  return (
    <div
      className={cn("w-full flex justify-center overflow-x-auto p-2 sm:p-4 print:p-0 print:overflow-visible", className)}
      style={{
        transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
        transformOrigin: "top center",
      }}
    >
      {/* Printable A4 Resume Sheet */}
      <div
        id="resume-a4-sheet"
        className={cn(
          "w-full max-w-[800px] min-h-[1060px] bg-white text-slate-900 shadow-xl rounded-sm p-8 sm:p-12 print:shadow-none print:m-0 print:p-0 print:w-full print:max-w-none print:min-h-0",
          activeTemplate === "classic" && "font-serif",
          activeTemplate === "modern" && "font-sans",
          activeTemplate === "minimal" && "font-sans"
        )}
      >
        {/* ================= HEADER ================= */}
        {activeTemplate === "classic" && (
          <header className="text-center pb-5 border-b border-slate-300 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 uppercase">
              {personalInfo.fullName || "Your Full Name"}
            </h1>
            {personalInfo.headline && (
              <p className="text-sm font-medium text-slate-700 mt-1 italic">
                {personalInfo.headline}
              </p>
            )}
            <div className="text-xs text-slate-600 mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
              {personalInfo.email && (
                <a href={`mailto:${personalInfo.email}`} className="hover:underline text-slate-800">
                  {personalInfo.email}
                </a>
              )}
              {personalInfo.phone && <span>{personalInfo.phone}</span>}
              {personalInfo.location && <span>{personalInfo.location}</span>}
              {personalInfo.linkedinUrl && (
                <a
                  href={formatUrl(personalInfo.linkedinUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-slate-800 font-medium"
                >
                  {personalInfo.linkedinUrl}
                </a>
              )}
              {personalInfo.githubUrl && (
                <a
                  href={formatUrl(personalInfo.githubUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-slate-800 font-medium"
                >
                  {personalInfo.githubUrl}
                </a>
              )}
              {personalInfo.portfolioUrl && (
                <a
                  href={formatUrl(personalInfo.portfolioUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-slate-800 font-medium"
                >
                  {personalInfo.portfolioUrl}
                </a>
              )}
            </div>
          </header>
        )}

        {activeTemplate === "modern" && (
          <header className="pb-5 border-b-2 border-slate-800 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 uppercase">
                  {personalInfo.fullName || "Your Full Name"}
                </h1>
                {personalInfo.headline && (
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">
                    {personalInfo.headline}
                  </p>
                )}
              </div>
              <div className="text-xs text-slate-600 space-y-0.5 sm:text-right font-medium">
                {personalInfo.email && (
                  <div>
                    <a href={`mailto:${personalInfo.email}`} className="hover:underline text-slate-800">
                      {personalInfo.email}
                    </a>
                  </div>
                )}
                {personalInfo.phone && <div>{personalInfo.phone}</div>}
                {personalInfo.location && <div>{personalInfo.location}</div>}
                {personalInfo.linkedinUrl && (
                  <div>
                    <a
                      href={formatUrl(personalInfo.linkedinUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-slate-800"
                    >
                      {personalInfo.linkedinUrl}
                    </a>
                  </div>
                )}
                {personalInfo.githubUrl && (
                  <div>
                    <a
                      href={formatUrl(personalInfo.githubUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-slate-800"
                    >
                      {personalInfo.githubUrl}
                    </a>
                  </div>
                )}
                {personalInfo.portfolioUrl && (
                  <div>
                    <a
                      href={formatUrl(personalInfo.portfolioUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-slate-800"
                    >
                      {personalInfo.portfolioUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        {activeTemplate === "minimal" && (
          <header className="pb-4 mb-5 border-b border-slate-200">
            <h1 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-wide">
              {personalInfo.fullName || "Your Full Name"}
            </h1>
            {personalInfo.headline && (
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mt-1">
                {personalInfo.headline}
              </p>
            )}
            <div className="text-xs text-slate-500 mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {personalInfo.email && (
                <a href={`mailto:${personalInfo.email}`} className="hover:underline text-slate-700">
                  {personalInfo.email}
                </a>
              )}
              {personalInfo.phone && <span>{personalInfo.phone}</span>}
              {personalInfo.location && <span>{personalInfo.location}</span>}
              {personalInfo.linkedinUrl && (
                <a
                  href={formatUrl(personalInfo.linkedinUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-slate-700"
                >
                  {personalInfo.linkedinUrl}
                </a>
              )}
              {personalInfo.githubUrl && (
                <a
                  href={formatUrl(personalInfo.githubUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-slate-700"
                >
                  {personalInfo.githubUrl}
                </a>
              )}
              {personalInfo.portfolioUrl && (
                <a
                  href={formatUrl(personalInfo.portfolioUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-slate-700"
                >
                  {personalInfo.portfolioUrl}
                </a>
              )}
            </div>
          </header>
        )}

        <div className="space-y-5 text-slate-800">
          {/* ================= SUMMARY ================= */}
          {summary && summary.trim().length > 0 && (
            <section className="print:break-inside-avoid">
              <h2
                className={cn(
                  "text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 mb-1.5 pb-1 border-b",
                  activeTemplate === "modern" && "border-slate-800",
                  activeTemplate === "classic" && "border-slate-400",
                  activeTemplate === "minimal" && "border-slate-200 text-slate-600"
                )}
              >
                Professional Summary
              </h2>
              <p className="text-xs sm:text-[13px] leading-relaxed text-slate-700 font-normal">
                {summary}
              </p>
            </section>
          )}

          {/* ================= EDUCATION ================= */}
          {education && education.length > 0 && (
            <section className="print:break-inside-avoid">
              <h2
                className={cn(
                  "text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 mb-2 pb-1 border-b",
                  activeTemplate === "modern" && "border-slate-800",
                  activeTemplate === "classic" && "border-slate-400",
                  activeTemplate === "minimal" && "border-slate-200 text-slate-600"
                )}
              >
                Education
              </h2>
              <div className="space-y-2.5">
                {education.map((edu) => (
                  <div key={edu.id} className="flex justify-between items-start text-xs sm:text-xs">
                    <div>
                      <div className="font-bold text-slate-900 text-xs sm:text-[13px]">
                        {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                      </div>
                      <div className="text-slate-700 font-medium">{edu.institution}</div>
                      {edu.score && (
                        <div className="text-slate-600 text-[11px] mt-0.5">
                          Academic Score: <span className="font-semibold">{edu.score}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right text-[11px] font-semibold text-slate-600 shrink-0 ml-4">
                      {edu.startYear} – {edu.endYear}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ================= TECHNICAL SKILLS ================= */}
          {skills && skills.length > 0 && (
            <section className="print:break-inside-avoid">
              <h2
                className={cn(
                  "text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 mb-2 pb-1 border-b",
                  activeTemplate === "modern" && "border-slate-800",
                  activeTemplate === "classic" && "border-slate-400",
                  activeTemplate === "minimal" && "border-slate-200 text-slate-600"
                )}
              >
                Technical Skills
              </h2>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200"
                  >
                    <span className="font-semibold text-slate-900">{s.name}</span>
                    <span className="text-[10px] text-slate-500">({s.proficiency})</span>
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* ================= PROJECTS ================= */}
          {projects && projects.length > 0 && (
            <section className="print:break-inside-avoid">
              <h2
                className={cn(
                  "text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 mb-2 pb-1 border-b",
                  activeTemplate === "modern" && "border-slate-800",
                  activeTemplate === "classic" && "border-slate-400",
                  activeTemplate === "minimal" && "border-slate-200 text-slate-600"
                )}
              >
                Projects
              </h2>
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div key={proj.id} className="text-xs sm:text-xs">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-900 text-xs sm:text-[13px]">
                        {proj.title}
                      </span>
                      {proj.role && (
                        <span className="text-[11px] font-medium italic text-slate-600">
                          {proj.role}
                        </span>
                      )}
                    </div>
                    {proj.description && (
                      <p className="text-slate-700 text-[11px] sm:text-xs mt-1 leading-normal">
                        {proj.description}
                      </p>
                    )}
                    {(proj.skillsUsed?.length > 0 || proj.githubUrl || proj.liveDemoUrl) && (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-600">
                        {proj.skillsUsed?.length > 0 && (
                          <span>
                            <strong className="text-slate-800">Tech Stack:</strong>{" "}
                            {proj.skillsUsed.join(", ")}
                          </span>
                        )}
                        {proj.githubUrl && (
                          <a
                            href={formatUrl(proj.githubUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-800 hover:text-blue-700 underline font-mono text-[10px]"
                          >
                            GitHub: {proj.githubUrl}
                          </a>
                        )}
                        {proj.liveDemoUrl && (
                          <a
                            href={formatUrl(proj.liveDemoUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-800 hover:text-blue-700 underline font-mono text-[10px]"
                          >
                            Live Demo: {proj.liveDemoUrl}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ================= EXPERIENCE ================= */}
          {experience && experience.length > 0 && (
            <section className="print:break-inside-avoid">
              <h2
                className={cn(
                  "text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 mb-2 pb-1 border-b",
                  activeTemplate === "modern" && "border-slate-800",
                  activeTemplate === "classic" && "border-slate-400",
                  activeTemplate === "minimal" && "border-slate-200 text-slate-600"
                )}
              >
                Experience
              </h2>
              <div className="space-y-3">
                {experience.map((exp) => (
                  <div key={exp.id} className="text-xs sm:text-xs">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="font-bold text-slate-900 text-xs sm:text-[13px]">
                          {exp.role}
                        </span>
                        <span className="text-slate-700 font-semibold ml-2">
                          — {exp.organization}
                        </span>
                        {exp.location && (
                          <span className="text-slate-500 text-[11px] ml-2">({exp.location})</span>
                        )}
                      </div>
                      <div className="text-right text-[11px] font-semibold text-slate-600 shrink-0 ml-4">
                        {exp.startDate} – {exp.currentlyWorking ? "Present" : exp.endDate}
                      </div>
                    </div>
                    {exp.description && (
                      <div className="text-slate-700 text-[11px] sm:text-xs mt-1 whitespace-pre-line leading-relaxed">
                        {exp.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ================= CERTIFICATIONS ================= */}
          {certifications && certifications.length > 0 && (
            <section className="print:break-inside-avoid">
              <h2
                className={cn(
                  "text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 mb-2 pb-1 border-b",
                  activeTemplate === "modern" && "border-slate-800",
                  activeTemplate === "classic" && "border-slate-400",
                  activeTemplate === "minimal" && "border-slate-200 text-slate-600"
                )}
              >
                Certifications
              </h2>
              <div className="space-y-1.5">
                {certifications.map((cert) => (
                  <div key={cert.id} className="flex justify-between text-xs sm:text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{cert.name}</span>
                      <span className="text-slate-600 ml-1.5">({cert.issuer})</span>
                      {cert.credentialUrl && (
                        <a
                          href={formatUrl(cert.credentialUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-700 hover:underline font-mono ml-2 font-semibold"
                        >
                          [View Credential]
                        </a>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold">{cert.issueDate}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ================= ACHIEVEMENTS ================= */}
          {achievements && achievements.length > 0 && (
            <section className="print:break-inside-avoid">
              <h2
                className={cn(
                  "text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 mb-2 pb-1 border-b",
                  activeTemplate === "modern" && "border-slate-800",
                  activeTemplate === "classic" && "border-slate-400",
                  activeTemplate === "minimal" && "border-slate-200 text-slate-600"
                )}
              >
                Achievements & Awards
              </h2>
              <div className="space-y-1.5">
                {achievements.map((ach) => (
                  <div key={ach.id} className="text-xs sm:text-xs">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-900">{ach.title}</span>
                      <span className="text-[11px] text-slate-500 font-semibold">{ach.date}</span>
                    </div>
                    {ach.description && (
                      <p className="text-[11px] text-slate-700 mt-0.5">{ach.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ================= LEADERSHIP / EXTRACURRICULAR ================= */}
          {leadership && leadership.length > 0 && (
            <section className="print:break-inside-avoid">
              <h2
                className={cn(
                  "text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 mb-2 pb-1 border-b",
                  activeTemplate === "modern" && "border-slate-800",
                  activeTemplate === "classic" && "border-slate-400",
                  activeTemplate === "minimal" && "border-slate-200 text-slate-600"
                )}
              >
                Leadership & Extracurricular
              </h2>
              <div className="space-y-2">
                {leadership.map((item) => (
                  <div key={item.id} className="text-xs sm:text-xs">
                    <div className="flex justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{item.position}</span>
                        <span className="text-slate-600 font-medium ml-1.5">— {item.organization}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-semibold">{item.duration}</span>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-slate-700 mt-0.5">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ================= OPTIONAL: COURSEWORK ================= */}
          {optionalSectionsConfig?.coursework && coursework && coursework.length > 0 && (
            <section className="print:break-inside-avoid">
              <h2
                className={cn(
                  "text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 mb-1.5 pb-1 border-b",
                  activeTemplate === "modern" && "border-slate-800",
                  activeTemplate === "classic" && "border-slate-400",
                  activeTemplate === "minimal" && "border-slate-200 text-slate-600"
                )}
              >
                Key Coursework
              </h2>
              <p className="text-xs text-slate-700">{coursework.join(" • ")}</p>
            </section>
          )}

          {/* ================= OPTIONAL: LANGUAGES ================= */}
          {optionalSectionsConfig?.languages && languages && languages.length > 0 && (
            <section className="print:break-inside-avoid">
              <h2
                className={cn(
                  "text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 mb-1.5 pb-1 border-b",
                  activeTemplate === "modern" && "border-slate-800",
                  activeTemplate === "classic" && "border-slate-400",
                  activeTemplate === "minimal" && "border-slate-200 text-slate-600"
                )}
              >
                Languages
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-700">
                {languages.map((l) => (
                  <span key={l.id}>
                    <strong className="text-slate-900">{l.language}:</strong> {l.fluency}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
