"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, FileKey2, Grid3X3, Landmark, ReceiptText, RefreshCcw, Save } from "lucide-react";
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
  hasPublishedSoftwareSettings,
  loadSoftwareSettings,
  saveSoftwareSettings,
  updateCustomiseSetting,
  updateDutiesTaxSetting,
  updateFeatureSetting,
  updateSalesBillingLayoutSetting,
  updateSalesDocumentSetting,
} from "../../application/software-settings-service";
import {
  defaultSoftwareSettingsState,
  type DutiesTaxSettings,
  type SalesDocumentSettings,
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
  type CoreEnvSettingOption,
} from "../../infrastructure/core-settings-api";
import { listIndustries } from "../../../industry/application/industry-service";
import { formatMoney } from "../../../sales/application/sales-service";

export function SettingsIndexPage() {
  return (
    <CommonListPageFrame
      description="Configure software behavior and feature availability for the active application context."
      technicalName="page.settings.index"
      title="Settings"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <SettingsLinkCard
          description="Enable application modules from a grouped app catalog."
          href="/desk/settings/apps"
          icon={<Grid3X3 className="size-5" />}
          title="Apps"
        />
        <SettingsLinkCard
          description="Edit grouped runtime .env values for application, frontend, backend, database, and security."
          href="/desk/settings/core"
          icon={<FileKey2 className="size-5" />}
          title="Core Settings"
        />
        <SettingsLinkCard
          description="Configure sales billing item fields by selected industry."
          href="/desk/settings/billing-layout"
          icon={<ReceiptText className="size-5" />}
          title="Sales Settings"
        />
        <SettingsLinkCard
          description="Maintain duties, taxes, and opening GST balances for reports."
          href="/desk/settings/duties-taxes"
          icon={<Landmark className="size-5" />}
          title="Duties & Taxes"
        />
        <SettingsLinkCard
          description="Run deployment preflight, sync from GitHub, rebuild Docker, and restart the app."
          href="/desk/settings/system-update"
          icon={<RefreshCcw className="size-5" />}
          title="System Update"
        />
      </div>
    </CommonListPageFrame>
  );
}

export function CoreSettingsPage() {
  const { show } = useGlobalLoader();
  const [industryOptions, setIndustryOptions] = useState<readonly CoreEnvSettingOption[]>([]);
  const [settings, setSettings] = useState<CoreEnvSettingsResponse | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const hide = show();
    Promise.all([
      getCoreEnvSettings({ signal: controller.signal }),
      listIndustries({ signal: controller.signal }).catch(() => []),
    ])
      .then(([nextSettings, industries]) => {
        const nextIndustryOptions = industries
          .filter((industry) => industry.isActive)
          .map((industry) => ({
            value: industry.code,
            label: `${industry.code} - ${industry.name}`,
            description: `Use ${industry.code} (${industry.name}) as the active billing industry.`,
          }));
        setSettings(nextSettings);
        setIndustryOptions(nextIndustryOptions);
        setValues(normalizeCoreValues(flattenEnvValues(nextSettings.groups), nextIndustryOptions));
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
      setValues(normalizeCoreValues(flattenEnvValues(nextSettings.groups), industryOptions));
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
          industryOptions={industryOptions}
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

export function SalesBillingLayoutSettingsPage() {
  const [publishedState, setPublishedState] =
    useState<SoftwareSettingsState>(defaultSoftwareSettingsState);
  const [draftState, setDraftState] = useState<SoftwareSettingsState>(defaultSoftwareSettingsState);
  const hasUnpublishedChanges = !areSoftwareSettingsEqual(publishedState, draftState);

  useEffect(() => {
    const loadedSettings = loadSoftwareSettings();
    setPublishedState(loadedSettings);
    setDraftState(loadedSettings);

    if (hasPublishedSoftwareSettings()) {
      return;
    }

    const controller = new AbortController();
    void getCoreEnvSettings({ signal: controller.signal })
      .then((settings) => {
        const appType = flattenEnvValues(settings.groups).APP_TYPE;
        setDraftState((current) => ({
          ...current,
          salesBillingLayout: salesBillingLayoutDefaultsForIndustry(appType),
        }));
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  function publishLive() {
    saveSoftwareSettings(draftState);
    setPublishedState(draftState);
      toast.success("Sales billing layout published", {
      description: "Sales entry and print screens now use the published sales settings.",
    });
  }

  return (
    <CommonListPageFrame
      action={
        <Button
          className="rounded-xl"
          disabled={!hasUnpublishedChanges}
          onClick={publishLive}
        >
          <Save className="size-4" />
          Publish live
        </Button>
      }
      description="Configure sales layout, document numbering, customisation, and feature switches."
      technicalName="page.settings.billing-layout"
      title="Sales Settings"
    >
      <AnimatedTabs
        tabs={[
          {
            value: "layout",
            label: "Layout",
            content: (
              <Card className="rounded-md border-border/70">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Sales Layout</CardTitle>
                  <CardDescription>
                    Toggle fields as a draft, then publish live to update sales entry and print screens.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {draftState.salesBillingLayout.map((setting) => (
                    <SettingSwitchRow
                      key={setting.id}
                      setting={setting}
                      onToggle={(enabled) =>
                        setDraftState((current) =>
                          updateSalesBillingLayoutSetting(current, setting.id, enabled),
                        )
                      }
                    />
                  ))}
                </CardContent>
              </Card>
            ),
          },
          {
            value: "document",
            label: "Docu settings",
            content: (
              <Card className="rounded-md border-border/70">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Document Settings</CardTitle>
                  <CardDescription>
                    Set the sales invoice prefix and starting serial used for new invoices.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <SalesDocumentSettingField
                    label="Invoice prefix"
                    value={draftState.salesDocumentSettings.invoicePrefix}
                    onChange={(value) =>
                      setDraftState((current) =>
                        updateSalesDocumentSetting(current, "invoicePrefix", value),
                      )
                    }
                  />
                  <SalesDocumentSettingField
                    label="Invoice serial start"
                    value={draftState.salesDocumentSettings.invoiceSerialStart}
                    onChange={(value) =>
                      setDraftState((current) =>
                        updateSalesDocumentSetting(current, "invoiceSerialStart", value),
                      )
                    }
                  />
                </CardContent>
              </Card>
            ),
          },
          {
            value: "customise",
            label: "Customise",
            content: (
              <div className="grid gap-4">
                {draftState.customiseGroups.map((group) => (
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
                            setDraftState((current) =>
                              updateCustomiseSetting(current, setting.id, enabled),
                            )
                          }
                        />
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ),
          },
          {
            value: "features",
            label: "Features",
            content: (
              <div className="grid gap-3">
                {draftState.features.map((feature) => (
                  <SettingSwitchRow
                    key={feature.id}
                    setting={feature}
                    onToggle={(enabled) =>
                      setDraftState((current) => updateFeatureSetting(current, feature.id, enabled))
                    }
                  />
                ))}
              </div>
            ),
          },
        ]}
      />
    </CommonListPageFrame>
  );
}

function areSettingsEqual(
  left: readonly SoftwareToggleSetting[],
  right: readonly SoftwareToggleSetting[],
) {
  if (left.length !== right.length) return false;
  return left.every((setting, index) => {
    const other = right[index];
    return other?.id === setting.id && other.enabled === setting.enabled;
  });
}

function areSoftwareSettingsEqual(left: SoftwareSettingsState, right: SoftwareSettingsState) {
  return (
    areSettingsEqual(left.salesBillingLayout, right.salesBillingLayout) &&
    areDocumentSettingsEqual(left.salesDocumentSettings, right.salesDocumentSettings) &&
    areDutiesTaxSettingsEqual(left.dutiesTaxSettings, right.dutiesTaxSettings) &&
    areSettingsEqual(left.features, right.features) &&
    left.customiseGroups.length === right.customiseGroups.length &&
    left.customiseGroups.every((group, index) =>
      group.id === right.customiseGroups[index]?.id &&
      areSettingsEqual(group.settings, right.customiseGroups[index]?.settings ?? []),
    )
  );
}

function areDutiesTaxSettingsEqual(left: DutiesTaxSettings, right: DutiesTaxSettings) {
  return (
    left.openingGstAsOnDate === right.openingGstAsOnDate &&
    left.openingGstCgst === right.openingGstCgst &&
    left.openingGstIgst === right.openingGstIgst &&
    left.openingGstSgst === right.openingGstSgst
  );
}

function areDocumentSettingsEqual(left: SalesDocumentSettings, right: SalesDocumentSettings) {
  return (
    left.invoicePrefix === right.invoicePrefix &&
    left.invoiceSerialStart === right.invoiceSerialStart
  );
}

function salesBillingLayoutDefaultsForIndustry(appType: string | undefined) {
  const industryKind = normalizeIndustryKind(appType);
  const garment = industryKind === "garment";
  const offset = industryKind === "offset" || !garment;

  return defaultSoftwareSettingsState.salesBillingLayout.map((setting) => {
    if (setting.id === "sales-use-po") return { ...setting, enabled: offset };
    if (setting.id === "sales-use-dc") return { ...setting, enabled: offset };
    if (setting.id === "sales-use-colour") return { ...setting, enabled: garment };
    if (setting.id === "sales-use-size") return { ...setting, enabled: garment };
    if (setting.id === "sales-use-einvoice") return { ...setting, enabled: garment };
    if (setting.id === "sales-use-eway") return { ...setting, enabled: true };
    return setting;
  });
}

function SalesDocumentSettingField({
  label,
  onChange,
  value,
}: {
  readonly label: string;
  readonly onChange: (value: string) => void;
  readonly value: string;
}) {
  return (
    <label className="grid gap-2 rounded-md border border-border/70 bg-background px-3 py-3">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input
        className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-foreground/40"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function CoreSettingsGroupForm({
  group,
  industryOptions,
  values,
  onChange,
}: {
  readonly group: CoreEnvGroup;
  readonly industryOptions: readonly CoreEnvSettingOption[];
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
            industryOptions={industryOptions}
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
  industryOptions,
  setting,
  value,
  onChange,
}: {
  readonly industryOptions: readonly CoreEnvSettingOption[];
  readonly setting: CoreEnvSetting;
  readonly value: string;
  readonly onChange: (value: string) => void;
}) {
  const isBoolean = value === "true" || value === "false";
  const options = setting.key === "APP_TYPE" && industryOptions.length > 0
    ? industryOptions
    : setting.options;

  return (
    <label className="grid gap-2 rounded-md border border-border/70 bg-background px-3 py-3">
      <span className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{setting.label}</span>
        <Badge variant="outline" className="rounded-md text-[11px]">
          {setting.key}
        </Badge>
      </span>
      {options?.length ? (
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm capitalize outline-none transition-colors focus:border-foreground/40"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
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
      {options?.length ? (
        <span className="text-xs leading-5 text-muted-foreground">
          {options.find((option) => option.value === value)?.description ??
            setting.description}
        </span>
      ) : null}
      {!options?.length ? (
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

export function DutiesTaxesSettingsPage() {
  const [state, setState] = useSettingsState();
  const openingGstTotal = totalOpeningGst(state.dutiesTaxSettings);

  return (
    <CommonListPageFrame
      action={
        <Button className="rounded-xl" onClick={() => saveSoftwareSettings(state)}>
          <Save className="size-4" />
          Save
        </Button>
      }
      description="Set opening GST balances used by GST Statement reports."
      technicalName="page.settings.duties-taxes"
      title="Duties & Taxes"
    >
      <Card className="rounded-md border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Opening GST</CardTitle>
          <CardDescription>
            Enter opening IGST, CGST, and SGST balances with the date this balance applies from.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
            <DutiesTaxField
              label="As on date"
              type="date"
              value={state.dutiesTaxSettings.openingGstAsOnDate}
              onChange={(value) =>
                setState((current) => updateDutiesTaxSetting(current, "openingGstAsOnDate", value))
              }
            />
            <DutiesTaxField
              label="IGST"
              value={state.dutiesTaxSettings.openingGstIgst}
              onChange={(value) =>
                setState((current) => updateDutiesTaxSetting(current, "openingGstIgst", value))
              }
            />
            <DutiesTaxField
              label="CGST"
              value={state.dutiesTaxSettings.openingGstCgst}
              onChange={(value) =>
                setState((current) => updateDutiesTaxSetting(current, "openingGstCgst", value))
              }
            />
            <DutiesTaxField
              label="SGST"
              value={state.dutiesTaxSettings.openingGstSgst}
              onChange={(value) =>
                setState((current) => updateDutiesTaxSetting(current, "openingGstSgst", value))
              }
            />
            <label className="grid gap-2 rounded-md border border-border/70 bg-muted/25 px-3 py-3">
              <span className="text-sm font-medium text-foreground">Total</span>
              <input
                readOnly
                className="h-10 rounded-md border border-input bg-background px-3 text-right text-sm font-semibold outline-none"
                value={formatMoney(openingGstTotal)}
              />
            </label>
          </div>
        </CardContent>
      </Card>
    </CommonListPageFrame>
  );
}

function DutiesTaxField({
  label,
  onChange,
  type = "number",
  value,
}: {
  readonly label: string;
  readonly onChange: (value: string) => void;
  readonly type?: "date" | "number";
  readonly value: string;
}) {
  return (
    <label className="grid gap-2 rounded-md border border-border/70 bg-background px-3 py-3">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input
        className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-foreground/40"
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "0.01" : undefined}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function totalOpeningGst(settings: DutiesTaxSettings) {
  return (
    Number(settings.openingGstIgst || 0) +
    Number(settings.openingGstCgst || 0) +
    Number(settings.openingGstSgst || 0)
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

function normalizeCoreValues(
  values: Record<string, string>,
  industryOptions: readonly CoreEnvSettingOption[],
) {
  return {
    ...values,
    APP_TYPE: normalizeAppTypeToIndustry(values.APP_TYPE, industryOptions),
  };
}

function normalizeAppTypeToIndustry(
  value: string | undefined,
  industryOptions: readonly CoreEnvSettingOption[],
) {
  if (!value) return industryOptions[0]?.value ?? "";
  const exact = industryOptions.find((option) => option.value.toLowerCase() === value.toLowerCase());
  if (exact) return exact.value;

  const normalizedValue = normalizeIndustryText(value);
  const labelMatched = industryOptions.find((option) =>
    normalizeIndustryText(option.label).includes(normalizedValue),
  );
  if (labelMatched) return labelMatched.value;

  const industryKind = normalizeIndustryKind(value);
  const matched = industryOptions.find((option) => normalizeIndustryKind(option.value) === industryKind);
  return matched?.value ?? value;
}

function normalizeIndustryText(value: string | undefined) {
  return value?.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() ?? "";
}

function normalizeIndustryKind(value: string | undefined) {
  const normalized = normalizeIndustryText(value);
  if (normalized === "100" || normalized === "200") return "garment";
  if (normalized === "300") return "offset";
  if (normalized === "400") return "upvc";
  if (normalized === "500" || normalized === "600") return "shop";
  if (normalized.includes("garment") || normalized.includes("textile")) return "garment";
  if (normalized.includes("offset") || normalized.includes("printing")) return "offset";
  if (normalized.includes("upvc") || normalized.includes("u pvc")) return "upvc";
  if (normalized.includes("shop") || normalized.includes("commerce")) return "shop";
  return "other";
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}
