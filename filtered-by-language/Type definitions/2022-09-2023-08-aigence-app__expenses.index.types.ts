// Type imports
import { EActionTypes, EStatus } from "@aigence/types/enums";
import { IDynamicObject, IForm } from "@aigence/types/interfaces";

// Interfaces
export interface IExpenseMileageItem extends IExpenseItemBase {
  claimId: number;
  distance: number;
  mileageRate: number;
  passengers: number;
  trip: string;
}

export interface IExpenseExpenseItem extends IExpenseItemBase {
  claimId: number;
  merchant: string;
  netValue: number;
  receiptURL: string;
  vat: number;
}

export interface IExpenseItemBase {
  created: string;
  expenseClaimType: "expense" | "mileage";
  description: string;
  id: string;
  total: number;
  type: {
    id: number;
    name: string;
  };
}
export interface IExpense {
  actionType: EActionTypes;
  claimNumber: number;
  created: string;
  id: number;
  items: (IExpenseExpenseItem | IExpenseMileageItem)[];
  name: string;
  status: EStatus;
  updated: string;
  value: number;
}

// Interfaces (data tables)
export interface IDataTableExpenses {
  rawData: IExpense[];
  refreshData?: () => void;
}

export interface IDataTableExpensesItems {
  claimDate?: string;
  claimId?: number;
  hideAddMoreInFooter?: boolean;
  rawData: (IExpenseExpenseItem | IExpenseMileageItem)[];
  refreshData?: () => void;
  showAddForms?: boolean;
  showBorder?: boolean;
  status?: EStatus;
}

// Interfaces (forms)
export interface IFormExpensesExpenseAddEdit extends IForm, Partial<IExpenseExpenseItem> {}
export interface IFormExpensesMileageAddEdit extends IForm, Partial<IExpenseMileageItem> {}

// Types
// ...

// Types (data tables)
export type THandleDeleteClaimSuccess = (status: EStatus) => void;
export type THandleDeletionSuccess = (success: boolean) => void;

// Types (forms)
export type TGenerateFooter = (showStatus: boolean, status: EStatus) => React.ReactElement;
export type TGetMileageRate = (distance: number, passengers: number) => number;
export type TOnExpenseSubmit = (data: IDynamicObject) => void;
export type TOnMileageSubmit = (data: IDynamicObject) => void;
export type TSetMileageRate = (distance: number, rowId: number, totalPassengers: number) => void;
export type TUpdateNetValue = (currentVAT: number, currentTotal: number) => void;
export type TUpdateTotalExpenseItem = (currentNetValue: number, currentVAT: number) => void;
export type TUpdateTotalMileageItem = (currentDistance: number, currentMileageRate: number) => void;
