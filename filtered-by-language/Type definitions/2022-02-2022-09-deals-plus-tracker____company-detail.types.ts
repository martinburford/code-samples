// Interfaces
export interface ICompanyDetails {
  primary: {
    companyName: string;
    companyParent: string;
    countryIncorporated: string;
    countryTaxResident: string;
    dataMode?: "add" | "edit"; // This is required to identify how the form data is being presented within the modal (since it's only fetched and loaded ONCE)
    dateIncorporated: string;
    externalDebt: boolean;
    externalShareholders: boolean;
    financialYearEnd: string;
    functionalCurrency: string;
    ownership: number;
    legalEntity: "" | "partnership" | "corporation" | "limited-liabilty-company" | "trust";
  };
  other?: {
    commentsOnCompanyNumber?: string;
    companyNumber?: number;
    companyURL?: string;
    dataMode?: "add" | "edit"; // This is required to identify how the form data is being presented within the modal (since it's only fetched and loaded ONCE)
    employees?: boolean;
    opcoOrHoldco?: "" | "opco" | "holdco";
  };
  tax?: {
    commentsToTaxReferenceNumber?: string;
    country?: string;
    dataMode?: "add" | "edit"; // This is required to identify how the form data is being presented within the modal (since it's only fetched and loaded ONCE)
    taxReferenceNumber?: number;
    usEntityClassification?: "" | "Corporate" | "Disregarded" | "None" | "Partnership";
    vatRegistered?: boolean;
    vatRegistrationNumber?: number;
  };
  address?: {
    city?: string;
    country?: string;
    dataMode?: "add" | "edit"; // This is required to identify how the form data is being presented within the modal (since it's only fetched and loaded ONCE)
    line1?: string;
    line2?: string;
    postalCode?: string;
    state?: string;
  };
}

// Types
export type TAddressInformation = {
  [property in keyof ICompanyDetails["address"]]?: ICompanyDetails["address"][property];
};

export type TPrimaryInformation = {
  [property in keyof ICompanyDetails["primary"]]?: ICompanyDetails["primary"][property];
};

export type TOtherInformation = {
  [property in keyof ICompanyDetails["other"]]?: ICompanyDetails["other"][property];
};

export type TTaxInformation = {
  [property in keyof ICompanyDetails["tax"]]?: ICompanyDetails["tax"][property];
};
