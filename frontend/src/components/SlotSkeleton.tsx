"use client";

import Skeleton from "./ui/Skeleton";

export default function SlotSkeleton() {
  return (
    <div className="mt-6 space-y-5 animate-fade-in">
      {/* title */}
      <Skeleton className="h-5 w-40" />

      {/* slots */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
