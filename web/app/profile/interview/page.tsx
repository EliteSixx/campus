import { DashboardShell } from "@/components/shared/dashboard-shell";
import { MockInterview } from "@/features/samir/components/mock-interview/mock-interview";

export const metadata = {
  title: "AI-Assisted Mock Interview — CampusLink",
  description:
    "AI-assisted mock interview with a question bank and rule-based scoring, planned from your AI readiness and skill gaps.",
};

export default function MockInterviewPage() {
  return (
    <DashboardShell title="AI-Assisted Mock Interview">
      <MockInterview />
    </DashboardShell>
  );
}
