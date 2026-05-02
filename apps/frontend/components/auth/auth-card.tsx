import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@cxnext/ui";

interface AuthCardProps {
  readonly title: string;
  readonly description: string;
  readonly children: ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <Card className="w-full max-w-xl rounded-[28px] border-border/70 bg-background/95 shadow-xl shadow-black/5">
      <CardHeader className="space-y-2 pb-4 text-center">
        <CardTitle className="text-4xl font-semibold tracking-tight text-foreground">
          {title}
        </CardTitle>
        <CardDescription className="mx-auto max-w-lg text-sm leading-6 text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0 sm:px-8 sm:pb-8">{children}</CardContent>
    </Card>
  );
}
