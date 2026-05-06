import {
  defaultSoftwareSettingsState,
  type SoftwareSettingsState,
  type SoftwareToggleSetting,
} from "../domain/software-settings";

const storageKey = "cxnext-software-settings";

export function loadSoftwareSettings(): SoftwareSettingsState {
  if (typeof window === "undefined") {
    return defaultSoftwareSettingsState;
  }

  const storedValue = window.localStorage.getItem(storageKey);
  if (!storedValue) {
    return defaultSoftwareSettingsState;
  }

  try {
    return mergeSoftwareSettings(
      defaultSoftwareSettingsState,
      JSON.parse(storedValue) as Partial<SoftwareSettingsState>,
    );
  } catch {
    return defaultSoftwareSettingsState;
  }
}

export function saveSoftwareSettings(state: SoftwareSettingsState) {
  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

export function updateCustomiseSetting(
  state: SoftwareSettingsState,
  settingId: string,
  enabled: boolean,
): SoftwareSettingsState {
  return {
    ...state,
    customiseGroups: state.customiseGroups.map((group) => ({
      ...group,
      settings: updateToggleList(group.settings, settingId, enabled),
    })),
  };
}

export function updateFeatureSetting(
  state: SoftwareSettingsState,
  settingId: string,
  enabled: boolean,
): SoftwareSettingsState {
  return {
    ...state,
    features: updateToggleList(state.features, settingId, enabled),
  };
}

function updateToggleList(
  settings: readonly SoftwareToggleSetting[],
  settingId: string,
  enabled: boolean,
) {
  return settings.map((setting) => (setting.id === settingId ? { ...setting, enabled } : setting));
}

function mergeSoftwareSettings(
  defaults: SoftwareSettingsState,
  storedState: Partial<SoftwareSettingsState>,
): SoftwareSettingsState {
  const storedCustomiseSettings = new Map(
    (storedState.customiseGroups ?? [])
      .flatMap((group) => group.settings ?? [])
      .map((setting) => [setting.id, setting.enabled]),
  );
  const storedFeatures = new Map(
    (storedState.features ?? []).map((setting) => [setting.id, setting.enabled]),
  );

  return {
    customiseGroups: defaults.customiseGroups.map((group) => ({
      ...group,
      settings: group.settings.map((setting) => ({
        ...setting,
        enabled: storedCustomiseSettings.get(setting.id) ?? setting.enabled,
      })),
    })),
    features: defaults.features.map((setting) => ({
      ...setting,
      enabled: storedFeatures.get(setting.id) ?? setting.enabled,
    })),
  };
}
