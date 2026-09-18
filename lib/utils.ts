import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  return new Date(dateString).toLocaleDateString("en-IN", options);
}

export function getDaysRemaining(deadlineStr: string): number {
  const target = new Date(deadlineStr).getTime();
  const now = new Date().getTime();
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}
