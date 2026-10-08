"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Network, X } from "lucide-react";
import {
  DEMO_NETWORK_NODES,
  DEMO_NETWORK_EDGES,
  DemoNetworkNode,
} from "@/data/demo-alumni";
import { cn } from "@/lib/utils";

interface SimNode extends DemoNetworkNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const NODE_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  alumni: { fill: "rgba(140, 45, 20, 0.9)", stroke: "rgba(140, 45, 20, 1)", text: "#ffffff" },
  mentee: { fill: "rgba(250, 238, 210, 0.95)", stroke: "rgba(175, 95, 10, 0.6)", text: "rgba(60, 48, 36, 1)" },
  company: { fill: "rgba(224, 240, 228, 0.95)", stroke: "rgba(30, 110, 65, 0.6)", text: "rgba(15, 12, 9, 1)" },
};

const EDGE_COLORS: Record<string, string> = {
  mentoring: "rgba(140, 45, 20, 0.25)",
  works_at: "rgba(30, 110, 65, 0.25)",
  referred_to: "rgba(175, 95, 10, 0.25)",
};

export default function NetworkGraphPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number>(0);
  const [nodes, setNodes] = useState<SimNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<SimNode | null>(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: 500 });
  const nodesRef = useRef<SimNode[]>([]);

  // Initialize nodes with random positions
  useEffect(() => {
    const w = dimensions.w;
    const h = dimensions.h;
    const initialNodes: SimNode[] = DEMO_NETWORK_NODES.map((n, i) => ({
      ...n,
      x: w / 2 + (Math.random() - 0.5) * w * 0.6,
      y: h / 2 + (Math.random() - 0.5) * h * 0.6,
      vx: 0,
      vy: 0,
    }));
    nodesRef.current = initialNodes;
    setNodes([...initialNodes]);
  }, [dimensions]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const parent = svgRef.current.parentElement;
        if (parent) {
          setDimensions({
            w: parent.clientWidth,
            h: Math.max(400, parent.clientHeight),
          });
        }
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Force simulation
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (nodesRef.current.length === 0) return;

    const edges = DEMO_NETWORK_EDGES;
    const centerX = dimensions.w / 2;
    const centerY = dimensions.h / 2;
    let tickCount = 0;
    const maxTicks = 300;

    const tick = () => {
      const ns = nodesRef.current;
      const alpha = Math.max(0.01, 1 - tickCount / maxTicks);

      // Repulsive force between all nodes
      for (let i = 0; i < ns.length; i++) {
        for (let j = i + 1; j < ns.length; j++) {
          let dx = ns[j].x - ns[i].x;
          let dy = ns[j].y - ns[i].y;
          let dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const repulse = (800 * alpha) / (dist * dist);
          const fx = (dx / dist) * repulse;
          const fy = (dy / dist) * repulse;
          ns[i].vx -= fx;
          ns[i].vy -= fy;
          ns[j].vx += fx;
          ns[j].vy += fy;
        }
      }

      // Attractive force along edges
      const nodeMap = new Map(ns.map((n) => [n.id, n]));
      for (const edge of edges) {
        const a = nodeMap.get(edge.source);
        const b = nodeMap.get(edge.target);
        if (!a || !b) continue;
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = 120;
        const attract = ((dist - targetDist) * 0.02 * alpha);
        const fx = (dx / dist) * attract;
        const fy = (dy / dist) * attract;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }

      // Center gravity
      for (const n of ns) {
        n.vx += (centerX - n.x) * 0.005 * alpha;
        n.vy += (centerY - n.y) * 0.005 * alpha;
      }

      // Apply velocity with damping
      for (const n of ns) {
        n.vx *= 0.7;
        n.vy *= 0.7;
        n.x += n.vx;
        n.y += n.vy;
        // Constrain to bounds
        n.x = Math.max(30, Math.min(dimensions.w - 30, n.x));
        n.y = Math.max(30, Math.min(dimensions.h - 30, n.y));
      }

      tickCount++;
      setNodes([...ns]);

      if (tickCount < maxTicks) {
        animRef.current = requestAnimationFrame(tick);
      }
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [dimensions]);

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const getNodeRadius = (type: string) => {
    if (type === "company") return 28;
    if (type === "alumni") return 22;
    return 18;
  };

  return (
    <DashboardShell title="Alumni Network Graph">
      {/* Header Banner */}
      <Card className="p-6 border border-border bg-surface text-ink shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-bold text-ink">
                Alumni Network Graph
              </h2>
            </div>
            <p className="text-xs text-ink-muted mt-1 max-w-2xl font-medium">
              Visualize the connections between alumni, mentees, and companies.
              Click any node to see details.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-accent" />
              <span className="text-[10px] font-bold text-ink-muted">
                Alumni
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-warning-soft border border-warning/40" />
              <span className="text-[10px] font-bold text-ink-muted">
                Mentees
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-success-soft border border-success/40" />
              <span className="text-[10px] font-bold text-ink-muted">
                Companies
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Graph + Side Panel */}
      <div className="mt-5 flex gap-4">
        {/* Graph Container */}
        <Card className="flex-1 border border-border bg-surface overflow-hidden min-h-[500px] relative">
          <div className="overflow-x-auto overflow-y-hidden w-full h-full">
            <svg
              ref={svgRef}
              width={dimensions.w}
              height={Math.max(500, dimensions.h)}
              className="w-full min-w-[600px]"
              style={{ minHeight: 500 }}
            >
              {/* Edges */}
              {DEMO_NETWORK_EDGES.map((edge, i) => {
                const source = nodeMap.get(edge.source);
                const target = nodeMap.get(edge.target);
                if (!source || !target) return null;
                return (
                  <line
                    key={i}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={EDGE_COLORS[edge.relation]}
                    strokeWidth={1.5}
                    strokeDasharray={
                      edge.relation === "referred_to" ? "4 3" : undefined
                    }
                  />
                );
              })}

              {/* Nodes */}
              {nodes.map((node) => {
                const r = getNodeRadius(node.type);
                const colors = NODE_COLORS[node.type];
                const isSelected = selectedNode?.id === node.id;
                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer"
                    style={{ transition: "transform 0.05s" }}
                  >
                    {/* Selection ring */}
                    {isSelected && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={r + 4}
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth={2}
                        opacity={0.6}
                      />
                    )}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={r}
                      fill={colors.fill}
                      stroke={colors.stroke}
                      strokeWidth={node.type === "company" ? 2 : 1}
                    />
                    <text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={colors.text}
                      fontSize={node.type === "company" ? 8 : 9}
                      fontWeight={700}
                      fontFamily="Inter, system-ui, sans-serif"
                    >
                      {node.type === "company"
                        ? node.label.length > 10
                          ? node.label.slice(0, 9) + "…"
                          : node.label
                        : node.initials}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </Card>

        {/* Side Panel */}
        {selectedNode && (
          <Card className="w-72 shrink-0 p-5 border border-border bg-surface text-ink shadow-sm self-start hidden md:block">
            <div className="flex items-center justify-between mb-3">
              <Badge
                tone={
                  selectedNode.type === "alumni"
                    ? "accent"
                    : selectedNode.type === "mentee"
                    ? "warning"
                    : "success"
                }
                className="text-[10px] capitalize"
              >
                {selectedNode.type}
              </Badge>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-ink-muted hover:text-ink p-0.5 rounded hover:bg-surface-raised transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm border",
                  selectedNode.type === "alumni"
                    ? "bg-accent text-white border-accent"
                    : selectedNode.type === "mentee"
                    ? "bg-accent-soft text-accent border-accent/20"
                    : "bg-success-soft text-success border-success/30"
                )}
              >
                {selectedNode.initials ||
                  selectedNode.label.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-bold text-ink">
                  {selectedNode.label}
                </div>
                <div className="text-[10px] text-ink-muted font-medium capitalize">
                  {selectedNode.type}
                </div>
              </div>
            </div>

            {/* Connections */}
            <div className="border-t border-border pt-3">
              <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wide">
                Connections
              </span>
              <div className="mt-2 space-y-1.5">
                {DEMO_NETWORK_EDGES.filter(
                  (e) =>
                    e.source === selectedNode.id ||
                    e.target === selectedNode.id
                ).map((edge, i) => {
                  const otherId =
                    edge.source === selectedNode.id
                      ? edge.target
                      : edge.source;
                  const other = DEMO_NETWORK_NODES.find(
                    (n) => n.id === otherId
                  );
                  if (!other) return null;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-ink"
                    >
                      <div
                        className={cn(
                          "h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold border shrink-0",
                          other.type === "alumni"
                            ? "bg-accent text-white border-accent"
                            : other.type === "mentee"
                            ? "bg-accent-soft text-accent border-accent/20"
                            : "bg-success-soft text-success border-success/30"
                        )}
                      >
                        {other.initials || other.label.charAt(0)}
                      </div>
                      <span className="font-medium truncate">
                        {other.label}
                      </span>
                      <Badge
                        tone="neutral"
                        className="text-[8px] ml-auto shrink-0"
                      >
                        {edge.relation.replace("_", " ")}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
