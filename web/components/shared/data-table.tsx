import { ReactNode } from "react";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T>({ columns, data, keyFn }: { columns: Column<T>[]; data: T[]; keyFn: (row: T) => string }) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            {columns.map((col) => (
              <th key={col.header} className="whitespace-nowrap px-3 py-2.5 text-xs font-medium text-ink-muted">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={keyFn(row)} className="border-b border-border last:border-0 hover:bg-surface-raised/60">
              {columns.map((col) => (
                <td key={col.header} className={`px-3 py-3 ${col.className ?? ""}`}>
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
