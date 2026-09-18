import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-16 w-full rounded-2xl" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
