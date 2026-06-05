"use client";

type Props = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function ErrorState({
  title,
  description,
  actionLabel,
  onAction,
}: Props) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 px-8 py-10 text-center">
        <div className="mb-4 text-5xl">💈</div>

        <h1 className="text-3xl font-bold text-white">{title}</h1>

        <p className="mt-4 text-slate-300">{description}</p>

        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="mt-8 rounded-2xl bg-white px-6 py-3 font-semibold text-black"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
