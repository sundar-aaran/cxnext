"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, FileKey2, Save, SlidersHorizontal, ToggleLeft } from "lucide-react";
import {
  AnimatedTabs,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CommonListPageFrame,
  Switch,
  cn,
  useGlobalLoader,
} from "@cxnext/ui";
import {
  loadSoftwareSettings,
  saveSoftwareSettings,
  updateCustomiseSetting,
  updateFeatureSetting,
} from "../../application/software-settings-service";
import {
  defaultSoftwareSettingsState,
  type SoftwareSettingsState,
  type SoftwareToggleSetting,
} from "../../domain/software-settings";
import {
  getCoreEnvSettings,
  updateCoreEnvSettings,
  type CoreEnvGroup,
  type CoreEnvPolicy,
  type CoreEnvPolicyItem,
  type CoreEnvSettingsResponse,
  type CoreEnvSetting,
} from "../../infrastructure/core-settings-api";

export function SettingsIndexPage() {
  return (
    <CommonListPageFrame
      description="Configure software behavior and feature availability for the active application context."
      technicalName="page.settings.index"
      title="Settings"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <SettingsLinkCard
          description="Edit grouped runtime .env values for application, frontend, backend, database, and security."
          href="/desk/settings/core"
          icon={<FileKey2 className="size-5" />}
          title="Core Settings"
        />
        <SettingsLinkCard
          description="Application shape, print layout, master data, and workflow options by industry/client."
          href="/desk/settings/customise"
          icon={<SlidersHorizontal className="size-5" />}
          title="Customise"
        />
        <SettingsLinkCard
          description="Feature switches for modules that can later be persisted per industry or client."
          href="/desk/settings/features"
          icon={<ToggleLeft className="size-5" />}
          title="Features"
        />
      </div>
    </CommonListPageFrame>
  );
}

export function CoreSettingsPage() {
  const { show } = useGlobalLoader();
  const [settings, setSettings] = useState<CoreEnvSettingsResponse | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const hide = show();
    getCoreEnvSettings({ signal: controller.signal })
      .then((nextSettings) => {
        setSettings(nextSettings);
        setValues(flattenEnvValues(nextSettings.groups));
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setLoadError(error instanceof Error ? error.message : "Could not load core settings.");
      })
      .finally(() => {
        if (!controller.signal.aborted) hide();
      });

    return () => {
      controller.abort();
      hide();
    };
  }, [show]);

  async function save() {
    const hide = show();
    try {
      const nextSettings = await updateCoreEnvSettings(values);
      setSettings(nextSettings);
      setValues(flattenEnvValues(nextSettings.groups));
      toast.success(".env updated");
    } catch (error) {
      toast.error("Could not update .env", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      hide();
    }
  }

  const tabs =
    settings?.groups.map((group) => ({
      value: group.id,
      label: group.label,
      content: (
        <CoreSettingsGroupForm
          group={group}
          values={values}
          onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))}
        />
      ),
    })) ?? [];

  return (
    <CommonListPageFrame
      action={
        <Button className="rounded-xl" onClick={() => void save()} disabled={!settings}>
          <Save className="size-4" />
          Save .env
        </Button>
      }
      description="Grouped editor for the root .env values used by startup, database, API, frontend, and security."
      technicalName="page.settings.core"
      title="Core Settings"
    >
      {settings?.envFilePath ? (
        <p className="rounded-md border border-border/70 bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
          Editing <span className="font-medium text-foreground">{settings.envFilePath}</span>
        </p>
      ) : null}
      {loadError ? (
        <Card className="rounded-md border-destructive/40">
          <CardContent className="p-4 text-sm text-destructive">{loadError}</CardContent>
        </Card>
      ) : null}
      {settings ? (
        <AnimatedTabs
          tabs={[
            ...tabs,
            {
              value: "policy",
              label: "Env Policy",
              content: <EnvPolicy policy={settings.policy} />,
            },
            {
              value: "raw",
              label: ".env reference",
              content: <EnvReference raw={settings.raw} />,
            },
          ]}
        />
      ) : null}
    </CommonListPageFrame>
  );
}

export function CustomiseSettingsPage() {
  const [state, setState] = useSettingsState();

  return (
    <CommonListPageFrame
      description="Scaffold industry-specific and client-specific application configuration."
      technicalName="page.settings.customise"
      title="Customise"
    >
      <div className="grid gap-4">
        {state.customiseGroups.map((group) => (
          <Card key={group.id} className="rounded-md border-border/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{group.title}</CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {group.settings.map((setting) => (
                <SettingSwitchRow
                  key={setting.id}
                  setting={setting}
                  onToggle={(enabled) =>
                    setState((current) => updateCustomiseSetting(current, setting.id, enabled))
                  }
                />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </CommonListPageFrame>
  );
}

function CoreSettingsGroupForm({
  group,
  values,
  onChange,
}: {
  readonly group: CoreEnvGroup;
  readonly values: Record<string, string>;
  readonly onChange: (key: string, value: string) => void;
}) {
  return (
    <Card className="rounded-md border-border/70">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{group.label}</CardTitle>
        <CardDescription>{group.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {group.settings.map((setting) => (
          <CoreEnvField
            key={setting.key}
            setting={setting}
            value={values[setting.key] ?? ""}
            onChange={(value) => onChange(setting.key, value)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function CoreEnvField({
  setting,
  value,
  onChange,
}: {
  readonly setting: CoreEnvSetting;
  readonly value: string;
  readonly onChange: (value: string) => void;
}) {
  const isBoolean = value === "true" || value === "false";

  return (
    <label className="grid gap-2 rounded-md border border-border/70 bg-background px-3 py-3">
      <span className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{setting.label}</span>
        <Badge variant="outline" className="rounded-md text-[11px]">
          {setting.key}
        </Badge>
      </span>
      {setting.options?.length ? (
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm capitalize outline-none transition-colors focus:border-foreground/40"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {setting.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : isBoolean ? (
        <span className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">{value === "true" ? "Enabled" : "Disabled"}</span>
          <Switch
            checked={value === "true"}
            aria-label={setting.label}
            onCheckedChange={(checked) => onChange(String(checked))}
          />
        </span>
      ) : (
        <input
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-foreground/40"
          type={setting.sensitive ? "password" : "text"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {setting.options?.length ? (
        <span className="text-xs leading-5 text-muted-foreground">
          {setting.options.find((option) => option.value === value)?.description ??
            setting.description}
        </span>
      ) : null}
      {!setting.options?.length ? (
        <span className="text-xs leading-5 text-muted-foreground">{setting.description}</span>
      ) : null}
    </label>
  );
}

function EnvReference({ raw }: { readonly raw: string }) {
  return (
    <Card className="rounded-md border-border/70">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">.env Reference</CardTitle>
        <CardDescription>Current root .env content after comments and grouping are preserved.</CardDescription>
      </CardHeader>
      <CardContent>
        <textarea
          readOnly
          className="min-h-[420px] w-full resize-y rounded-md border border-border/70 bg-muted/35 p-4 font-mono text-xs leading-5 text-foreground outline-none"
          value={raw}
        />
      </CardContent>
    </Card>
  );
}

function EnvPolicy({ policy }: { readonly policy: CoreEnvPolicy }) {
  return (
    <div className="grid gap-4">
      <EnvPolicySection
        description="These values belong in .env and are editable from Core Settings."
        items={policy.managed}
        title="Keep In .env"
      />
      <EnvPolicySection
        description="These values are intentionally excluded. Saving Core Settings removes excluded keys from .env."
        items={policy.excluded}
        title="Do Not Keep In .env"
      />
      <EnvPolicySection
        description="These keys are present in .env but are not part of the current policy. Review before keeping long term."
        emptyText="No unmanaged keys found."
        items={policy.unmanaged}
        title="Needs Review"
      />
    </div>
  );
}

function EnvPolicySection({
  description,
  emptyText,
  items,
  title,
}: {
  readonly description: string;
  readonly emptyText?: string;
  readonly items: readonly CoreEnvPolicyItem[];
  readonly title: string;
}) {
  return (
    <Card className="rounded-md border-border/70">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {items.length === 0 ? (
          <p className="rounded-md border border-border/70 bg-muted/25 px-3 py-2 text-sm text-muted-foreground">
            {emptyText ?? "No keys."}
          </p>
        ) : (
          items.map((item) => (
            <div
              key={`${item.status}-${item.key}`}
              className="grid gap-1 rounded-md border border-border/70 bg-background px-3 py-2"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-md font-mono text-[11px]">
                  {item.key}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-md text-[11px] capitalize",
                    item.status === "managed" && "border-emerald-200 bg-emerald-50 text-emerald-700",
                    item.status === "excluded" && "border-rose-200 bg-rose-50 text-rose-700",
                    item.status === "unmanaged" && "border-amber-200 bg-amber-50 text-amber-700",
                  )}
                >
                  {item.status}
                </Badge>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">{item.reason}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function FeatureSettingsPage() {
  const [state, setState] = useSettingsState();
  const enabledCount = useMemo(
    () => state.features.filter((feature) => feature.enabled).length,
    [state.features],
  );

  return (
    <CommonListPageFrame
      description="Toggle software features by industry and client scope."
      technicalName="page.settings.features"
      title="Features"
    >
      <div className="rounded-md border border-border/70 bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
        <span className="font-medium text-foreground">{enabledCount}</span> of{" "}
        <span className="font-medium text-foreground">{state.features.length}</span> features
        enabled for this scaffold.
      </div>
      <div className="grid gap-3">
        {state.features.map((feature) => (
          <SettingSwitchRow
            key={feature.id}
            setting={feature}
            onToggle={(enabled) =>
              setState((current) => updateFeatureSetting(current, feature.id, enabled))
            }
          />
        ))}
      </div>
    </CommonListPageFrame>
  );
}

function useSettingsState() {
  const [state, setState] = useState<SoftwareSettingsState>(defaultSoftwareSettingsState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setState(loadSoftwareSettings());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    saveSoftwareSettings(state);
  }, [isLoaded, state]);

  return [state, setState] as const;
}

function SettingsLinkCard({
  description,
  href,
  icon,
  title,
}: {
  readonly description: string;
  readonly href: string;
  readonly icon: ReactNode;
  readonly title: string;
}) {
  return (
    <Card className="rounded-md border-border/70 transition-colors hover:border-foreground/25">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex size-10 items-center justify-center rounded-md bg-muted text-foreground">
            {icon}
          </div>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={href}>Open</Link>
          </Button>
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function SettingSwitchRow({
  setting,
  onToggle,
}: {
  readonly setting: SoftwareToggleSetting;
  readonly onToggle: (enabled: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border/70 bg-card px-4 py-3 shadow-sm">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-foreground">{setting.label}</p>
          <Badge
            className={cn(
              "rounded-md border px-2 py-0.5 text-[11px] capitalize",
              setting.scope === "industry"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-sky-200 bg-sky-50 text-sky-700",
            )}
            variant="outline"
          >
            {setting.scope}
          </Badge>
          {setting.enabled ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="size-3.5" />
              Enabled
            </span>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">{setting.description}</p>
      </div>
      <Switch checked={setting.enabled} aria-label={setting.label} onCheckedChange={onToggle} />
    </div>
  );
}

function flattenEnvValues(groups: readonly CoreEnvGroup[]) {
  return Object.fromEntries(
    groups.flatMap((group) => group.settings.map((setting) => [setting.key, setting.value])),
  );
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}
