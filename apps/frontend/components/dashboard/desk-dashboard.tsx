import { Activity, Boxes, CheckCircle2, LayoutDashboard, Workflow } from "lucide-react";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@cxnext/ui";

const cards = [
  { title: "Module Readiness", value: "Foundation", detail: "No business domains installed" },
  { title: "Event Bus", value: "In-process", detail: "Async-ready internal dispatch" },
  { title: "Workspace", value: "desk", detail: "Application dashboard route" },
] as const;

export function DeskDashboard() {
  return (
    <section className="space-y-6 p-5 md:p-8">
      <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge variant="outline">desk</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal">Application Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            A clean workspace shell for future bounded contexts without installing business features.
          </p>
        </div>
        <div className="flex gap-2 text-muted-foreground">
          <LayoutDashboard className="h-5 w-5" />
          <Workflow className="h-5 w-5" />
          <Boxes className="h-5 w-5" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardDescription>{card.title}</CardDescription>
              <CardTitle className="text-xl">{card.value}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {card.detail}
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Operating Surface</CardTitle>
          <CardDescription>Prepared for future modules, workflows, and event streams.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          <p className="rounded-md border border-border bg-muted/40 p-4">Bounded contexts mount through module contracts.</p>
          <p className="rounded-md border border-border bg-muted/40 p-4">Application actions publish domain events.</p>
          <p className="rounded-md border border-border bg-muted/40 p-4">Dashboard pages stay feature-scoped under desk.</p>
        </CardContent>
      </Card>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Activity className="h-4 w-4" />
        Ready for the next domain module.
      </div>
    </section>
  );
}
