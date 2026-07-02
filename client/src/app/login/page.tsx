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
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl">
            🏨
          </div>
          <h1 className="text-2xl font-bold text-white">The Grand Terrace</h1>
          <p className="mt-1 text-sm text-stone-400">Staff Portal</p>
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
      </div>
    </div>
  );
}
