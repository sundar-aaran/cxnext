import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { readonly children: ReactNode }) {
  return (
    <main className="grid min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_30%),linear-gradient(180deg,rgba(248,250,252,1)_0%,rgba(241,245,249,0.9)_100%)] px-5 py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col">
        <Link href="/" className="mb-8 text-sm font-semibold tracking-[0.2em] text-foreground/80 uppercase">
          cxnext
        </Link>
        <div className="grid flex-1 items-center gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <section className="space-y-5">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/60">
              Secure access shell
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Sign in once, work inside the right tenant.
            </h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              The software resolves your tenant after login and carries your role permissions into
              the desk session.
            </p>
            <div className="grid gap-3 text-sm text-muted-foreground sm:max-w-xl">
              <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 backdrop-blur">
                Use the same sign-in surface for workspace access, tenant routing, and role-based
                controls.
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/50 px-4 py-3 backdrop-blur">
                Admin users can continue from here into user provisioning and permission
                management.
              </div>
            </div>
          </section>
          <section className="flex justify-center">{children}</section>
        </div>
      </div>
    </main>
  );
}
