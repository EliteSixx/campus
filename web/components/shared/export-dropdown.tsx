"use client";

import { useState, useRef, useEffect } from "react";
import {
  Download,
  ChevronDown,
  FileSpreadsheet,
  FileCode,
  FileText,
  Printer,
  Table,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ExportFormat = "csv" | "excel" | "json" | "tsv" | "pdf";

export interface ExportDropdownProps {
  filename?: string;
  title?: string;
  headers: string[];
  rows: (string | number)[][];
  jsonData?: Record<string, any>[];
  label?: string;
  variant?: "outline" | "primary" | "secondary";
  size?: "sm" | "md";
  align?: "left" | "right";
  className?: string;
  onExport?: (format: ExportFormat) => void;
}

export function ExportDropdown({
  filename = "export_data",
  title,
  headers,
  rows,
  jsonData,
  label = "Export",
  variant = "outline",
  size = "sm",
  align = "right",
  className,
  onExport,
}: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const [recentFormat, setRecentFormat] = useState<ExportFormat | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const triggerDownload = (blob: Blob, ext: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.${ext}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleExport = (format: ExportFormat) => {
    setRecentFormat(format);
    setOpen(false);

    if (format === "csv") {
      // CSV with UTF-8 BOM for Excel compatibility
      const csvContent = [
        headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(","),
        ...rows.map((r) =>
          r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      triggerDownload(blob, "csv");
    } else if (format === "excel") {
      // Excel-compatible HTML Spreadsheet with UTF-8
      const htmlTable = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8"/>
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>${(title || filename).substring(0, 30)}</x:Name>
                  <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
          <style>
            th { background-color: #1e293b; color: #ffffff; font-weight: bold; border: 1px solid #cbd5e1; padding: 6px 10px; }
            td { border: 1px solid #e2e8f0; padding: 5px 10px; }
          </style>
        </head>
        <body>
          <h2>${title || filename}</h2>
          <p>Exported: ${new Date().toLocaleString()} · ${rows.length} records</p>
          <table>
            <thead>
              <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (r) =>
                    `<tr>${r
                      .map((c) => `<td>${c ?? ""}</td>`)
                      .join("")}</tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
        </html>
      `;
      const blob = new Blob(["\uFEFF" + htmlTable], {
        type: "application/vnd.ms-excel;charset=utf-8;",
      });
      triggerDownload(blob, "xls");
    } else if (format === "json") {
      // Structured JSON format
      const dataToExport =
        jsonData ||
        rows.map((row) => {
          const item: Record<string, any> = {};
          headers.forEach((h, i) => {
            item[h] = row[i];
          });
          return item;
        });
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: "application/json;charset=utf-8;",
      });
      triggerDownload(blob, "json");
    } else if (format === "tsv") {
      // TSV (Tab Separated Values)
      const tsvContent = [
        headers.join("\t"),
        ...rows.map((r) => r.map((c) => String(c ?? "").replace(/\t/g, " ")).join("\t")),
      ].join("\n");
      const blob = new Blob(["\uFEFF" + tsvContent], {
        type: "text/tab-separated-values;charset=utf-8;",
      });
      triggerDownload(blob, "tsv");
    } else if (format === "pdf") {
      // Print / Save to PDF dialog
      const printWin = window.open("", "_blank");
      if (printWin) {
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title || filename}</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 28px; color: #0f172a; margin: 0; }
                .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px; }
                h1 { font-size: 20px; font-weight: 700; margin: 0 0 4px 0; color: #0f172a; }
                .meta { font-size: 11px; color: #64748b; margin: 0; }
                table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 12px; }
                th { background-color: #f1f5f9; color: #1e293b; padding: 8px 10px; border: 1px solid #cbd5e1; text-align: left; font-weight: 600; }
                td { padding: 6px 10px; border: 1px solid #e2e8f0; color: #334155; }
                tr:nth-child(even) { background-color: #f8fafc; }
                @media print {
                  body { padding: 0; }
                  @page { margin: 12mm; size: landscape; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${title || filename}</h1>
                <p class="meta">Exported on ${new Date().toLocaleString()} · Total ${rows.length} records</p>
              </div>
              <table>
                <thead>
                  <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
                </thead>
                <tbody>
                  ${rows
                    .map(
                      (r) =>
                        `<tr>${r.map((c) => `<td>${c ?? ""}</td>`).join("")}</tr>`
                    )
                    .join("")}
                </tbody>
              </table>
              <script>
                window.onload = function() {
                  window.print();
                };
              </script>
            </body>
          </html>
        `);
        printWin.document.close();
      }
    }

    if (onExport) {
      onExport(format);
    }
  };

  const options: {
    format: ExportFormat;
    label: string;
    ext: string;
    desc: string;
    icon: typeof Download;
    badge?: string;
  }[] = [
    {
      format: "csv",
      label: "CSV Spreadsheet",
      ext: ".csv",
      desc: "Universal standard for Excel, Sheets & databases",
      icon: Table,
      badge: "Standard",
    },
    {
      format: "excel",
      label: "Microsoft Excel",
      ext: ".xls",
      desc: "Formatted workbook with stylized tables",
      icon: FileSpreadsheet,
      badge: "Office",
    },
    {
      format: "json",
      label: "JSON Structure",
      ext: ".json",
      desc: "Structured key-value pairs for APIs & analytics",
      icon: FileCode,
      badge: "Developer",
    },
    {
      format: "tsv",
      label: "TSV (Tab-Delimited)",
      ext: ".tsv",
      desc: "Tab-separated text for quick paste & scripts",
      icon: FileText,
    },
    {
      format: "pdf",
      label: "Print / PDF Report",
      ext: ".pdf",
      desc: "Formatted document preview ready to save as PDF",
      icon: Printer,
    },
  ];

  return (
    <div className={cn("relative inline-block text-left", className)} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-lg border font-semibold transition-all duration-150 active:scale-[0.98]",
          variant === "outline" &&
            "border-border bg-surface text-ink hover:bg-surface-raised hover:border-border-strong",
          variant === "primary" &&
            "border-transparent bg-accent text-white hover:opacity-95 shadow-sm shadow-accent/20",
          variant === "secondary" &&
            "border-border bg-surface-raised text-ink hover:bg-border",
          size === "sm" && "h-9 px-3 text-xs",
          size === "md" && "h-10 px-4 text-sm",
          open && "ring-2 ring-accent/30 border-accent"
        )}
        title="Export data in multiple formats"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Download className="h-3.5 w-3.5" />
        <span>{label}</span>
        <ChevronDown
          className={cn("h-3 w-3 text-ink-muted transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className={cn(
            "absolute top-full mt-1.5 z-50 w-64 rounded-xl border border-border bg-surface p-2 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          <div className="border-b border-border/60 px-2 pb-2 mb-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-ink uppercase tracking-wider">
                Export Options
              </span>
              <span className="text-[10px] text-ink-muted">
                {rows.length} rows
              </span>
            </div>
            <p className="text-[10px] text-ink-muted mt-0.5">
              Choose your preferred download format:
            </p>
          </div>

          <div className="space-y-1">
            {options.map((opt) => {
              const Icon = opt.icon;
              const isRecent = recentFormat === opt.format;
              return (
                <button
                  key={opt.format}
                  type="button"
                  onClick={() => handleExport(opt.format)}
                  className="group flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-surface-raised"
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-raised border border-border/60 text-ink-muted group-hover:border-accent/40 group-hover:bg-accent-soft group-hover:text-accent transition-colors">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-ink group-hover:text-accent transition-colors">
                        {opt.label}
                      </span>
                      {opt.badge && (
                        <span className="rounded bg-accent/10 px-1.5 py-0.2 text-[9px] font-bold text-accent">
                          {opt.badge}
                        </span>
                      )}
                      {isRecent && (
                        <Check className="ml-auto h-3 w-3 text-success shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-ink-muted leading-tight line-clamp-1">
                      {opt.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-2 border-t border-border/60 pt-1.5 px-2 text-[10px] text-ink-faint flex items-center justify-between">
            <span>Encoding: UTF-8</span>
            <span className="font-mono">.{filename.split(".").pop()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
