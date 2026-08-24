import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import ThemeToggle from "@/components/ThemeToggle";
import SignOutButton from "./SignOutButton";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f8fc] dark:bg-[#0b1120] transition-colors duration-200">
      <div className="pointer-events-none absolute inset-0 bg-mesh" aria-hidden />

      <main className="relative mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-16 sm:px-6">
        <div className="absolute right-4 top-6 sm:right-6">
          <ThemeToggle />
        </div>
        <h1 className="mt-3 text-xl font-medium text-slate-700 dark:text-slate-200">
          Welcome
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Minimal template with authentication.
        </p>

        <div className="mt-8 space-y-3">
          {user ? (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Signed in as{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {user.email}
                </span>
                {user.role ? (
                  <span className="ml-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                    {user.role}
                  </span>
                ) : null}
              </p>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-teal-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Sign in
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
