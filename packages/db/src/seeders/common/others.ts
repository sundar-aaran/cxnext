import { commonDefinition, defaultRow, rowsWithDefault } from "./common-master-definitions";
import { createCommonMasterSeeder } from "./common-master-seeder";

export const othersCommonSeeders = [
  createCommonMasterSeeder(
    commonDefinition("currencies"),
    90,
    rowsWithDefault([{ code: "INR", name: "Indian Rupee", symbol: "INR", decimal_places: 2 }], {
      symbol: "-",
      decimal_places: 0,
    }),
  ),
  createCommonMasterSeeder(commonDefinition("paymentTerms"), 91, [
    defaultRow({ due_days: 0 }),
    { code: "NET30", name: "Net 30", description: "Payment due in 30 days", due_days: 30 },
  ]),
] as const;
