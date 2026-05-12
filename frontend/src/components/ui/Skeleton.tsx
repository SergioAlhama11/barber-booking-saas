"use client";

export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        bg-gray-900/80 border border-gray-800
        ${className}
      `}
    >
      <div className="skeleton-shimmer absolute inset-0" />
    </div>
  );
}
