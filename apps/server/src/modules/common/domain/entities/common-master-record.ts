export interface CommonMasterRecord {
  readonly id: number;
  readonly code: string | null;
  readonly name: string | null;
  readonly description: string | null;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
}

export type CommonMasterUpsertParams = Omit<
  CommonMasterRecord,
  "id" | "createdAt" | "updatedAt" | "deletedAt"
>;
