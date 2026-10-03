import * as React from "react";
import { cn } from "@/lib/utils";
type P = React.HTMLAttributes<HTMLDivElement>;
const Card = React.forwardRef<HTMLDivElement, P>(({ className, ...p }, ref) => <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...p} />);
const CardHeader = React.forwardRef<HTMLDivElement, P>(({ className, ...p }, ref) => <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...p} />);
const CardTitle = React.forwardRef<HTMLDivElement, P>(({ className, ...p }, ref) => <div ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...p} />);
const CardContent = React.forwardRef<HTMLDivElement, P>(({ className, ...p }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...p} />);
Card.displayName = "Card"; CardHeader.displayName = "CardHeader"; CardTitle.displayName = "CardTitle"; CardContent.displayName = "CardContent";
export { Card, CardHeader, CardTitle, CardContent };
