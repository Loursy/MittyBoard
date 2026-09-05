import { LayoutGrid } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { PasswordInput } from "../components/ui/PasswordInput";
import { PasswordStrengthMeter } from "../components/ui/PasswordStrengthMeter";
import { useAuth } from "../hooks/useAuth";
import { apiErrorMessage } from "../lib/api";

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register(fullName, email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, "Could not create your account."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div
        className="animate-glow-pulse pointer-events-none absolute -left-16 top-1/4 size-72 rounded-full bg-fuchsia-500/15 blur-3xl"
        aria-hidden
      />
      <div
        className="animate-glow-pulse pointer-events-none absolute -right-16 bottom-1/4 size-72 rounded-full bg-indigo-500/20 blur-3xl [animation-delay:1.2s]"
        aria-hidden
      />

      <div className="animate-pop-in glass-panel relative w-full max-w-sm rounded-2xl border border-[var(--color-border)] p-7 shadow-2xl shadow-black/40">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="animate-float-soft mb-3 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-[0_4px_16px_-4px_rgba(129,140,248,0.6)]">
            <LayoutGrid className="size-5 text-white" />
          </span>
          <h1 className="text-lg font-semibold text-white">Create your account</h1>
          <p className="mt-1 text-sm text-slate-400">Start organizing work in minutes.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Full name" htmlFor="fullName">
            <Input
              id="fullName"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ada Lovelace"
            />
          </Field>
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Password" htmlFor="password">
            <PasswordInput
              id="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
            <PasswordStrengthMeter password={password} />
          </Field>

          {error && (
            <p className="animate-pop-in rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" className="mt-1 w-full justify-center" isLoading={isSubmitting}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-indigo-400 transition-colors hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
