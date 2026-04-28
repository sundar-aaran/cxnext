import type { ReactNode } from "react";
import { DeskShell } from "../../features/desk/desk-shell";

export default function AppLayout({ children }: { readonly children: ReactNode }) {
  return <DeskShell>{children}</DeskShell>;
}
