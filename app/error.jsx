"use client";

export default function Error({ reset }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#eef3f8] px-5 text-center">
      <p className="text-ink/70">Something went wrong loading this page.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-teal-800 px-4 py-2 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}
