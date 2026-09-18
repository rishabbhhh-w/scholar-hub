import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-stone-200/80 dark:bg-[#153228]",
        className
      )}
      {...props}
    />
  );
}
