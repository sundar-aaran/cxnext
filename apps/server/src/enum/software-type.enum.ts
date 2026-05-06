export enum SoftwareType {
  Shop = "shop",
}

export const softwareTypeOptions = [
  {
    value: SoftwareType.Shop,
    label: "Shop",
    description: "Shop application surface for commerce, billing, masters, and entries.",
  },
] as const;
