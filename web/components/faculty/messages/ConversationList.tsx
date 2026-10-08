"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Paperclip, Plus, Search, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/components/faculty/announcements/utils";
import { cn } from "@/lib/utils";
import {
  initialsOf,
  participantSummary,
  type ListRow,
} from "./utils";

type Filter = "all" | "unread" | "groups";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "groups", label: "Groups" },
];

export function ConversationList({
  rows,
  selectedId,
  totalUnread,
  onNewMessage,
}: {
  rows: ListRow[];
  selectedId: string | null;
  totalUnread: number;
  onNewMessage: () => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = rows.filter((row) => {
    if (filter === "unread" && row.unreadCount === 0) return false;
    if (filter === "groups" && !row.isGroup) return false;

    const q = query.trim().toLowerCase();
    if (q === "") return true;
    return (
      row.subject.toLowerCase().includes(q) ||
      row.participantNames.some((name) => name.toLowerCase().includes(q))
    );
  });

  return (
    <Card className="flex h-full flex-col p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold tracking-tight text-ink">
          Messages
          {totalUnread > 0 && <Badge tone="accent">{totalUnread}</Badge>}
        </h2>
        <Button size="sm" onClick={onNewMessage}>
          <Plus className="h-3.5 w-3.5" />
          New message
        </Button>
      </div>

      <div className="relative mt-3">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
        <label htmlFor="conversation-search" className="sr-only">
          Search conversations
        </label>
        <Input
          id="conversation-search"
          placeholder="Search subject or name..."
          className="pl-9 text-xs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="mt-3 flex gap-1.5">
        {FILTERS.map((item) => {
          const active = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(item.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                active
                  ? "bg-accent text-white shadow-sm"
                  : "text-ink-muted hover:bg-surface-raised hover:text-ink",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="py-10 text-center">
            <MessageSquare className="mx-auto h-6 w-6 text-ink-faint" />
            <p className="mt-2 text-sm font-semibold text-ink">
              No conversations found
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              Try a different search or filter.
            </p>
          </div>
        ) : (
          filtered.map((row) => {
            const open = row.id === selectedId;
            const unread = row.unreadCount > 0;

            return (
              <Link
                key={row.id}
                href={`/faculty/messages/${row.id}`}
                aria-current={open ? "page" : undefined}
                className={cn(
                  "flex gap-2.5 rounded-lg border p-2.5 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  open
                    ? "border-accent/40 bg-accent-soft"
                    : "border-transparent hover:bg-surface-raised",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    open
                      ? "bg-accent text-white"
                      : "bg-surface-raised text-ink-muted",
                  )}
                  aria-hidden="true"
                >
                  {row.isGroup ? (
                    <Users className="h-3.5 w-3.5" />
                  ) : (
                    initialsOf(row.participantNames[0] ?? "?")
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "min-w-0 truncate text-xs",
                        unread ? "font-bold text-ink" : "font-semibold text-ink",
                      )}
                    >
                      {participantSummary(row.participantNames)}
                    </span>
                    {row.lastMessageAt && (
                      <span className="shrink-0 font-mono text-[10px] tabular text-ink-muted">
                        {formatDateTime(row.lastMessageAt)}
                      </span>
                    )}
                  </span>

                  <span
                    className={cn(
                      "mt-0.5 block truncate text-[11px]",
                      unread ? "font-semibold text-ink" : "text-ink-muted",
                    )}
                  >
                    {row.subject}
                  </span>

                  <span className="mt-0.5 flex items-center gap-1.5">
                    {row.hasAttachment && (
                      <Paperclip className="h-3 w-3 shrink-0 text-ink-muted" />
                    )}
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate text-[11px]",
                        unread ? "text-ink" : "text-ink-muted",
                      )}
                    >
                      {row.preview}
                    </span>
                    {unread && (
                      <Badge tone="accent" className="shrink-0 px-1.5 text-[9px]">
                        {row.unreadCount}
                      </Badge>
                    )}
                  </span>
                </span>
              </Link>
            );
          })
        )}
      </div>
    </Card>
  );
}
