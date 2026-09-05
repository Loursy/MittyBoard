/** Slow-drifting ambient blobs behind the login/register cards. */
export function AuthBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="animate-float-a absolute -top-24 -left-24 size-80 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="animate-float-b absolute -right-16 -bottom-24 size-96 rounded-full bg-fuchsia-500/15 blur-3xl" />
    </div>
  );
}
