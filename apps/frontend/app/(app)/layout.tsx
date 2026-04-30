import type { ReactNode } from "react";
import { DeskShell } from "../../features/desk/interface/shell/desk-shell";

export default function AppLayout({ children }: { readonly children: ReactNode }) {
  return <DeskShell>{children}</DeskShell>;
}
