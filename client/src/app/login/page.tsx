import { login } from "./actions";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Login</h1>
        </div>

        <form
          action={login}
          className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
        >
          <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-400">
              Invalid email or password. Please try again.
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-400 uppercase tracking-wider">
                Email or Username
              </label>
              <input
                name="email"
                type="text"
                required
                autoComplete="username"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-stone-600 focus:border-white/30 focus:outline-none focus:ring-0"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-400 uppercase tracking-wider">
                Password
              </label>
              <PasswordInput
                name="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                variant="dark"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 pr-9 text-sm text-white placeholder-stone-600 focus:border-white/30 focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-stone-900 hover:bg-stone-100 transition-colors"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-stone-600">
          Secure staff access only
        </p>

        <p className="mt-2 text-center text-xs text-stone-600">
          Developed by{" "}
          <a href="https://digihack.lk" target="_blank" rel="noreferrer" className="font-semibold text-stone-400 hover:text-stone-300">
            DigiHack
          </a>
          {" · "}
          <a href="tel:+94760142500" className="hover:text-stone-400">076 014 2500</a>
          {" · "}
          <a href="mailto:digihacklk@gmail.com" className="hover:text-stone-400">digihacklk@gmail.com</a>
        </p>
      </div>
    </div>
  );
}
