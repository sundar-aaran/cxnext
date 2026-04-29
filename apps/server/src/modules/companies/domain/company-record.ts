export interface CompanyLogoRecord {
  readonly id: string;
  readonly logoUrl: string;
  readonly logoType: string;
  readonly isActive: boolean;
}

export interface CompanyAddressRecord {
  readonly id: string;
  readonly addressType: string;
  readonly addressLine1: string;
  readonly addressLine2: string | null;
  readonly city: string | null;
  readonly district: string | null;
  readonly state: string | null;
  readonly country: string | null;
  readonly pincode: string | null;
  readonly isDefault: boolean;
  readonly isActive: boolean;
}

export interface CompanyEmailRecord {
  readonly id: string;
  readonly email: string;
  readonly emailType: string;
  readonly isActive: boolean;
}

export interface CompanyPhoneRecord {
  readonly id: string;
  readonly phoneNumber: string;
  readonly phoneType: string;
  readonly isPrimary: boolean;
  readonly isActive: boolean;
}

export interface CompanyBankAccountRecord {
  readonly id: string;
  readonly bankName: string;
  readonly accountNumber: string;
  readonly accountHolderName: string;
  readonly ifsc: string;
  readonly branch: string | null;
  readonly isPrimary: boolean;
  readonly isActive: boolean;
}

export interface CompanyRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly tenantName: string;
  readonly industryId: string;
  readonly industryName: string;
  readonly name: string;
  readonly legalName: string | null;
  readonly tagline: string | null;
  readonly shortAbout: string | null;
  readonly registrationNumber: string | null;
  readonly pan: string | null;
  readonly financialYearStart: string | null;
  readonly booksStart: string | null;
  readonly website: string | null;
  readonly description: string | null;
  readonly primaryEmail: string | null;
  readonly primaryPhone: string | null;
  readonly isPrimary: boolean;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly logos: readonly CompanyLogoRecord[];
  readonly addresses: readonly CompanyAddressRecord[];
  readonly emails: readonly CompanyEmailRecord[];
  readonly phones: readonly CompanyPhoneRecord[];
  readonly bankAccounts: readonly CompanyBankAccountRecord[];
}
