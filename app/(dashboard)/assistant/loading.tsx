import { Skeleton } from "@/components/ui/skeleton";

export default function AssistantLoading() {
  return (
    <div className="flex h-[calc(100vh-140px)] flex-col rounded-3xl border border-stone-200 bg-white p-6 dark:border-[#193c30] dark:bg-[#0c1c16] space-y-4">
      <Skeleton className="h-16 w-full rounded-2xl" />
      <Skeleton className="flex-1 w-full rounded-3xl" />
      <Skeleton className="h-12 w-full rounded-2xl" />
    </div>
  );
}
