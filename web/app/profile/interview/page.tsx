import { DashboardShell } from "@/components/shared/dashboard-shell";
import { MockInterview } from "@/features/samir/components/mock-interview/mock-interview";

export const metadata = {
  title: "Mock Interview — CampusLink",
  description: "Spoken mock interview planned from your AI skill analysis, with feedback on every answer.",
};

export default function MockInterviewPage() {
  return (
    <DashboardShell title="Mock Interview">
      <MockInterview />
    </DashboardShell>
  );
}
