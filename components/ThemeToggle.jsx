"use client";

import { useTheme } from "@/context/ThemeContext";

function SunIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function MoonIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

function SystemIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l2 1h2l2-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

export default function ThemeToggle({ variant = "button" }) {
  const { theme, resolvedTheme, setTheme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className="h-8 w-8 rounded-xl border border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-900/50" />
    );
  }

  if (variant === "segmented") {
    return (
      <div className="inline-flex items-center rounded-xl border border-slate-200/90 bg-white/80 p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
            theme === "light"
              ? "bg-slate-900 text-white shadow-sm dark:bg-teal-700"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
          title="Light Mode"
        >
          <SunIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
            theme === "dark"
              ? "bg-slate-900 text-white shadow-sm dark:bg-teal-700"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
          title="Dark Mode"
        >
          <MoonIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("system")}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
            theme === "system"
              ? "bg-slate-900 text-white shadow-sm dark:bg-teal-700"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
          title="System Sync"
        >
          <SystemIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Auto</span>
        </button>
      </div>
    );
  }

  // Compact cycle button variant
  const getIcon = () => {
    if (theme === "system") return resolvedTheme === "dark" ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />;
    if (theme === "dark") return <MoonIcon className="h-4 w-4" />;
    return <SunIcon className="h-4 w-4" />;
  };

  const getLabel = () => {
    if (theme === "system") return "Auto (System)";
    if (theme === "dark") return "Dark Mode";
    return "Light Mode";
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white/80 text-slate-700 shadow-sm transition-all hover:bg-slate-100 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800"
      title={`Theme: ${getLabel()} (Click to toggle)`}
      aria-label={`Current theme: ${getLabel()}`}
    >
      {getIcon()}
    </button>
  );
}
