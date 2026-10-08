"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, GripVertical, Calendar } from "lucide-react";
import {
  DEMO_REFERRAL_PIPELINE,
  DemoReferralPipeline,
  PipelineStage,
} from "@/data/demo-alumni";
import { cn } from "@/lib/utils";

import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const STAGES: { key: PipelineStage; label: string; tone: "warning" | "accent" | "neutral" | "success" | "cyan" }[] = [
  { key: "referred", label: "Referred", tone: "warning" },
  { key: "screening", label: "Screening", tone: "accent" },
  { key: "interview", label: "Interview", tone: "neutral" },
  { key: "offer", label: "Offer", tone: "success" },
  { key: "hired", label: "Hired", tone: "success" },
];

function SortableCard({ card }: { card: DemoReferralPipeline }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        className={cn(
          "p-3.5 border border-border bg-surface text-ink shadow-sm cursor-grab active:cursor-grabbing",
          isDragging && "ring-2 ring-accent/40"
        )}
      >
        <div className="flex items-start gap-2.5">
          <div
            {...listeners}
            className="mt-0.5 text-ink-faint hover:text-ink-muted cursor-grab"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent text-[10px] font-bold border border-accent/20 shrink-0">
                {card.avatarInitials}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-ink truncate">
                  {card.studentName}
                </div>
                <div className="text-[10px] text-ink-muted font-medium truncate">
                  {card.company}
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-ink-faint font-medium">
              <Calendar className="h-3 w-3" />
              {card.referredDate}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function PipelineCardOverlay({ card }: { card: DemoReferralPipeline }) {
  return (
    <Card className="p-3.5 border border-accent/40 bg-surface text-ink shadow-popover ring-2 ring-accent/20 w-56">
      <div className="flex items-start gap-2.5">
        <GripVertical className="h-3.5 w-3.5 mt-0.5 text-accent" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white text-[10px] font-bold shrink-0">
              {card.avatarInitials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-ink truncate">
                {card.studentName}
              </div>
              <div className="text-[10px] text-ink-muted font-medium truncate">
                {card.company}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function ReferralPipelinePage() {
  const [cards, setCards] = useState<DemoReferralPipeline[]>(
    DEMO_REFERRAL_PIPELINE
  );
  const [activeCard, setActiveCard] = useState<DemoReferralPipeline | null>(
    null
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const getCardsForStage = (stage: PipelineStage) =>
    cards.filter((c) => c.stage === stage);

  const handleDragStart = (event: DragStartEvent) => {
    const card = cards.find((c) => c.id === event.active.id);
    if (card) setActiveCard(card);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dropped over a stage column
    const targetStage = STAGES.find((s) => s.key === overId);
    if (targetStage) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === activeId ? { ...c, stage: targetStage.key } : c
        )
      );
      return;
    }

    // Dropped over another card — move to that card's stage
    const overCard = cards.find((c) => c.id === overId);
    if (overCard && overCard.id !== activeId) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === activeId ? { ...c, stage: overCard.stage } : c
        )
      );
    }
  };

  return (
    <DashboardShell title="Referral Pipeline">
      {/* Header Banner */}
      <Card className="p-6 border border-border bg-surface text-ink shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-bold text-ink">
                Referral Pipeline
              </h2>
            </div>
            <p className="text-xs text-ink-muted mt-1 max-w-2xl font-medium">
              Track students you&apos;ve referred through each hiring stage.
              Drag cards between columns to update their status.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge tone="accent" className="text-xs py-1 px-3 gap-1">
              <GitBranch className="h-3.5 w-3.5" />
              {cards.length} Referrals
            </Badge>
          </div>
        </div>
      </Card>

      {/* Kanban Board */}
      <div className="mt-5 overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 min-w-[900px]">
            {STAGES.map((stage) => {
              const stageCards = getCardsForStage(stage.key);
              return (
                <div
                  key={stage.key}
                  id={stage.key}
                  className="flex-1 min-w-[180px]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-ink">
                      {stage.label}
                    </span>
                    <Badge tone={stage.tone} className="text-[10px]">
                      {stageCards.length}
                    </Badge>
                  </div>
                  <div className="bg-surface-raised/50 rounded-xl border border-border/50 p-2.5 min-h-[300px] space-y-2.5">
                    <SortableContext
                      items={stageCards.map((c) => c.id)}
                      strategy={verticalListSortingStrategy}
                      id={stage.key}
                    >
                      {stageCards.map((card) => (
                        <SortableCard key={card.id} card={card} />
                      ))}
                    </SortableContext>
                    {stageCards.length === 0 && (
                      <div className="flex items-center justify-center h-24 text-[10px] text-ink-faint font-medium border border-dashed border-border rounded-lg">
                        Drop cards here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <DragOverlay>
            {activeCard && <PipelineCardOverlay card={activeCard} />}
          </DragOverlay>
        </DndContext>
      </div>
    </DashboardShell>
  );
}
