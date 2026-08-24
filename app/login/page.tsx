"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

function LoginForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    if (session.user.role === "ADMIN") {
      router.replace(callbackUrl);
      return;
    }
    signOut({ redirect: false }).then(() => {
      setError("Only admin accounts can sign in here.");
    });
  }, [status, session, router, callbackUrl]);

  useEffect(() => {
    const code = searchParams.get("error");
    if (!code) return;
    if (code === "CredentialsSignin" || code === "AccessDenied") {
      setError("Admin access only. Use an existing admin account.");
    } else {
      setError("Sign in failed. Please try again.");
    }
  }, [searchParams]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Admin access only. Use an existing admin account.");
        return;
      }

      router.replace(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (status === "loading" || (status === "authenticated" && session?.user?.role === "ADMIN")) {
    return (
      <div className="flex items-center justify-center py-6 text-xs font-semibold text-slate-400 dark:text-slate-500">
        <span className="animate-pulse">Checking credentials…</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Admin Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          className="auth-input text-xs"
          placeholder="admin@example.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            className="auth-input pr-16 text-xs"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 transition-colors"
          >
            {showPass ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <button type="submit" className="auth-submit mt-2" disabled={isLoading}>
        {isLoading ? "Authenticating…" : "Sign In to Admin Console"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f8fc] px-4 py-12 dark:bg-[#0b1120] transition-colors duration-200">
      <div className="pointer-events-none absolute inset-0 bg-mesh" aria-hidden />
      <div
        className="pointer-events-none absolute -top-24 right-10 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-500/10"
        aria-hidden
      />

      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="glass-card relative w-full max-w-md rounded-3xl p-7 shadow-xl sm:p-9">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 font-display text-xl font-bold text-white shadow-md shadow-teal-700/20">
            F
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Finds Admin
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Authorized Personnel Only</p>
          </div>
        </div>

        <p className="mt-4 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
          Sign in with your administrator credentials.
        </p>

        <div className="mt-6">
          <Suspense fallback={<p className="text-xs text-slate-400">Loading…</p>}>
            <LoginForm />
          </Suspense>
        </div>

        <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
          <Link href="/" className="text-xs font-semibold text-teal-800 dark:text-teal-400 hover:underline">
            ← Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
