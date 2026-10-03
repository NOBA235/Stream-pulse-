import * as React from "react";
import { cn } from "@/lib/utils";
export const Table = ({ className, ...p }: React.HTMLAttributes<HTMLTableElement>) => <div className="relative w-full overflow-auto"><table className={cn("w-full caption-bottom text-sm", className)} {...p} /></div>;
export const TableHeader = (p: React.HTMLAttributes<HTMLTableSectionElement>) => <thead {...p} className={cn("[&_tr]:border-b", p.className)} />;
export const TableBody = (p: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...p} className={cn("[&_tr:last-child]:border-0", p.className)} />;
export const TableRow = (p: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...p} className={cn("border-b transition-colors hover:bg-muted/50", p.className)} />;
export const TableHead = (p: React.ThHTMLAttributes<HTMLTableCellElement>) => <th {...p} className={cn("h-12 px-4 text-left align-middle font-medium text-muted-foreground", p.className)} />;
export const TableCell = (p: React.TdHTMLAttributes<HTMLTableCellElement>) => <td {...p} className={cn("p-4 align-middle", p.className)} />;
