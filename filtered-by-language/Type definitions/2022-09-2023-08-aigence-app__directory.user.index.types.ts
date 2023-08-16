// Type imports
import { IEmployeeCard } from "@aigence/components/widgets/employee-card/types/employee-card.types";
import { EStatus } from "@aigence/types/enums";
import { IDynamicObject, IForm } from "@aigence/types/interfaces";
import { IBenefit } from "@aigence/types/page/benefits/index.types";
import { ITimesheet } from "@aigence/types/page/timesheets/index.types";

// Interfaces
interface IEmergencyContactDetails {
  email: string;
  mobile: string;
  name: string;
  relationship: string;
}
interface IPersonalContactDetails {
  addressLine1: string;
  addressLine2: string;
  country: string;
  mobile: string;
  postalCode: string;
}

export interface IEmployeeDocuments {
  documents: {
    date: string;
    details: string;
    name: string;
    url: string;
  }[];
  id: number;
}

export interface IEmployeeSalary {
  id: number;
  bankDetails: {
    accountName: string;
    accountNumber: number;
    sortCode: string;
  };
  pendingSalaryRises: {
    activeFrom: string;
    newSalary: number;
    oldSalary: number;
    status: EStatus;
  }[];
  salary: {
    total: number;
  };
  salaryHistory: {
    activeFrom: string;
    newSalary: number;
    oldSalary: number;
    status: EStatus;
  }[];
}
export interface IFullProfile {
  summary: TSummary & {
    nationalInsuranceNumber: string;
  };
  emergencyContactDetails: IEmergencyContactDetails;
  personalContactDetails: IPersonalContactDetails;
}
export interface IFormsData {
  benefits: [] | IBenefit[];
  documents: object | IEmployeeDocuments;
  information: object | IFullProfile;
  salary: object | IEmployeeSalary;
  summary: IEmployeeCard;
  timesheets: ITimesheet[];
}

export interface IPayslip {
  bonus: number;
  date: string;
  grossPay: number;
  netPay: number;
  url: string;
}

// Interfaces (data tables)
export interface IDataTableEmployeeDocuments {
  rawData: IEmployeeDocuments;
}

export interface IDataTableSalaryHistory {
  rawData: IEmployeeSalary["salaryHistory"];
}

export interface IDataTableEmployeeSalaryPayslips {
  rawData: IPayslip[];
}

export interface IDataTableEmployeeSalaryPendingSalaryRises {
  rawData: IEmployeeSalary["pendingSalaryRises"];
}

// Interfaces (forms)
export interface IFormEmployeeInformationEdit extends IForm, Partial<IFullProfile> {
  loading: boolean;
}

export interface IFormSalaryBankDetailsAdd extends IForm {
  onDataUpdated: (data: IDynamicObject) => void;
}

export interface IFormSalaryAdd extends IForm {
  /** The data submitted when the form is valid */
  onDataUpdated: (data: IDynamicObject) => void;
}

export interface IFormSalaryEdit extends IForm, Partial<IEmployeeSalary> {
  loading: boolean;
  onPendingSalaryRiseUpdate: (data: IDynamicObject) => void;
}

// Types
type TSummary = Pick<IEmployeeCard["contactCard"], "department" | "email" | "firstName" | "jobTitle" | "lastName" | "phoneNumber"> & Pick<IEmployeeCard, "reportsTo">;
export type TOnBankDetailsAddUpdated = (data: IDynamicObject) => void;
export type TOnSalaryAddUpdated = (data: IDynamicObject) => void;
export type TPendingSalaryRises = IEmployeeSalary["pendingSalaryRises"];
export type TSendPayAdjustment = (props: IDynamicObject) => void;
