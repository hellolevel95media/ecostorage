"use client";

import type { Inquiry } from "@/types/database";
import { Button } from "@/components/ui/Button";

const COLUMNS: (keyof Inquiry)[] = [
  "created_at",
  "type",
  "name",
  "email",
  "phone",
  "company_name",
  "address",
  "message",
];

function escapeCsv(value: unknown): string {
  const str = value == null ? "" : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

export function ExportCsvButton({ inquiries }: { inquiries: Inquiry[] }) {
  function handleExport() {
    const rows = [
      COLUMNS.join(","),
      ...inquiries.map((row) => COLUMNS.map((col) => escapeCsv(row[col])).join(",")),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button type="button" variant="secondary" onClick={handleExport}>
      Export CSV
    </Button>
  );
}
