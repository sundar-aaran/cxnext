import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { readonly children: ReactNode }) {
  return (
    <main className="grid min-h-screen bg-muted/40 px-5 py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col">
        <Link href="/" className="mb-8 text-sm font-semibold">
          cxnext
        </Link>
        <div className="grid flex-1 items-center gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <section>
            <p className="text-sm font-medium text-primary">Secure access shell</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal">Auth surfaces ready for future modules.</h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              These pages are presentation only until an auth bounded context is added.
            </p>
          </section>
          <section className="flex justify-center">{children}</section>
        </div>
      </div>
    </main>
  );
}
