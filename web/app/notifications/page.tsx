"use client";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const mockNotifications = [
  {
    id: 1,
    type: "mentorship",
    title: "New mentorship request from Kavya Panda",
    description: "Looking for guidance on backend architecture.",
    time: "2h ago",
    read: false,
    color: "bg-accent",
  },
  {
    id: 2,
    type: "session",
    title: "Upcoming session: API Design Patterns",
    description: "With Siddharth Naik in 1 hour.",
    time: "3h ago",
    read: false,
    color: "bg-warning",
  },
  {
    id: 3,
    type: "guidance",
    title: "Priyanka Mohanty replied in Guidance Hub",
    description: "Check out the response to your question.",
    time: "1d ago",
    read: true,
    color: "bg-success",
  },
  {
    id: 4,
    type: "badge",
    title: "You unlocked a new badge: Top Mentor",
    description: "Congratulations on your active participation!",
    time: "2d ago",
    read: true,
    color: "bg-accent",
  },
  {
    id: 5,
    type: "mentorship",
    title: "Mentorship request accepted by Rahul Desai",
    description: "He is ready to review your portfolio.",
    time: "3d ago",
    read: true,
    color: "bg-success",
  },
];

export default function NotificationsPage() {
  return (
    <DashboardShell title="Notifications Center">
      <Card className="border border-border bg-surface text-ink shadow-sm max-w-4xl mt-4">
        <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4.5 w-4.5 text-accent" />
            <div>
              <CardTitle className="text-base font-bold text-ink">All Notifications</CardTitle>
              <CardDescription className="text-xs font-medium text-ink-muted">
                Your full notification history and updates.
              </CardDescription>
            </div>
          </div>
          <button className="text-xs font-bold text-accent hover:underline">
            Mark all as read
          </button>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="flex flex-col">
            {mockNotifications.map((notif) => (
              <div 
                key={notif.id} 
                className={cn(
                  "flex items-start gap-4 border-b border-border p-5 hover:bg-surface-raised transition-colors",
                  !notif.read && "bg-warning-soft/30 dark:bg-warning-soft/10"
                )}
              >
                <div className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", notif.color)} />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-ink">{notif.title}</p>
                    <p className="text-[10px] text-ink-faint font-bold uppercase tracking-wider">{notif.time}</p>
                  </div>
                  <p className="text-xs text-ink-muted font-medium">{notif.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
