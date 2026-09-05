import { cn } from "../../lib/cn";

function getStrength(password: string): { score: number; label: string } {
  if (!password) return { score: 0, label: "" };

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const clamped = Math.min(score, 4);
  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
  return { score: clamped, label: labels[clamped] };
}

const barColors = ["bg-rose-500", "bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-400"];
const labelColors = ["text-rose-400", "text-rose-400", "text-amber-400", "text-emerald-400", "text-emerald-400"];

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const { score, label } = getStrength(password);

  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn("h-1 flex-1 rounded-full bg-[var(--color-surface-3)]", i < score && barColors[score])}
          />
        ))}
      </div>
      <span className={cn("text-xs font-medium", labelColors[score])}>{label}</span>
    </div>
  );
}
