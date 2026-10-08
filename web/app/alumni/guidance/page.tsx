"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import {
  HelpCircle,
  MessageSquare,
  Clock,
  CheckCircle2,
  Send,
  Tag,
} from "lucide-react";
import {
  DEMO_GUIDANCE_QUESTIONS,
  getStudentById,
  getAlumniById,
} from "@/data/demo-alumni";

export default function AlumniGuidancePage() {
  const [questions] = useState(DEMO_GUIDANCE_QUESTIONS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const openCount = questions.filter((q) => q.status === "open").length;
  const resolvedCount = questions.filter((q) => q.status === "resolved").length;

  const handleReply = (questionId: string) => {
    // Demo: just clear the text
    setReplyText("");
  };

  return (
    <DashboardShell title="Guidance Hub">
      {/* Header */}
      <Card className="p-6 border border-border bg-surface text-ink shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-bold text-ink">Guidance Hub</h2>
            </div>
            <p className="text-xs text-ink-muted mt-1 font-medium max-w-xl">
              College-scoped Q&A board. Students from your college post career and technical questions — answer them to share your experience.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="warning" className="text-xs">{openCount} Open</Badge>
            <Badge tone="success" className="text-xs">{resolvedCount} Resolved</Badge>
          </div>
        </div>
      </Card>

      {/* Questions Feed */}
      <div className="mt-5 space-y-4">
        {questions.map((q) => {
          const student = getStudentById(q.studentId);
          const isExpanded = expandedId === q.id;
          return (
            <Card key={q.id} className="border border-border bg-surface text-ink overflow-hidden">
              {/* Question header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="w-full text-left p-4 hover:bg-surface-raised/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs font-bold text-ink">{q.title}</h3>
                      <Badge tone={q.status === "open" ? "warning" : "success"} className="text-[10px]">
                        {q.status === "open" ? "Open" : "Resolved"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-ink-muted font-medium">
                        Asked by <strong className="text-ink">{student?.name}</strong> · {q.createdAt}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      {q.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-0.5 rounded bg-surface-raised px-2 py-0.5 text-[10px] text-ink-muted font-semibold border border-border">
                          <Tag className="h-2.5 w-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-ink-muted font-medium shrink-0">
                    <MessageSquare className="h-3 w-3" />
                    {q.answers.length}
                  </div>
                </div>
              </button>

              {/* Expanded: Question body + answers */}
              {isExpanded && (
                <div className="border-t border-border">
                  <div className="p-4 bg-surface-raised/30">
                    <p className="text-xs text-ink font-medium leading-relaxed">{q.body}</p>
                  </div>

                  {/* Answers */}
                  {q.answers.length > 0 && (
                    <div className="border-t border-border divide-y divide-border">
                      {q.answers.map((ans) => {
                        const author = ans.authorRole === "alumni"
                          ? getAlumniById(ans.authorId)
                          : getStudentById(ans.authorId);
                        return (
                          <div key={ans.id} className="p-4">
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-accent text-[10px] font-bold border border-accent/20">
                                {ans.authorRole === "alumni" ? "A" : "S"}
                              </div>
                              <span className="text-[11px] font-bold text-ink">
                                {(author && "name" in author) ? author.name : "User"}
                              </span>
                              <Badge tone={ans.authorRole === "alumni" ? "accent" : "neutral"} className="text-[9px]">
                                {ans.authorRole === "alumni" ? "Alumni" : "Student"}
                              </Badge>
                              <span className="text-[10px] text-ink-faint font-medium flex items-center gap-0.5">
                                <Clock className="h-2.5 w-2.5" /> {ans.createdAt}
                              </span>
                            </div>
                            <p className="text-xs text-ink font-medium leading-relaxed pl-8">{ans.body}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Reply box */}
                  <div className="p-4 border-t border-border bg-surface-raised/20">
                    <div className="flex gap-2">
                      <Textarea
                        rows={2}
                        placeholder="Share your guidance or experience..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="text-xs"
                      />
                      <Button
                        size="sm"
                        className="shrink-0 gap-1 text-xs font-bold text-white bg-accent self-end"
                        onClick={() => handleReply(q.id)}
                        disabled={!replyText.trim()}
                      >
                        <Send className="h-3.5 w-3.5" />
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </DashboardShell>
  );
}
