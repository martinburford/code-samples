// Type imports
import { ISelect } from "components/atoms/select/types/select.types";
import { IShareholder } from "types/pages/shareholders/index.types";

// Enums

export enum TransactionTypes {
  BUYBACK = "Buyback",
  CANCELLATION = "Cancellation",
  ISSUANCE = "Issuance",
  TRANSFER = "Transfer",
}

// Interfaces
export interface ICapitalRegister {
  addedBy: {
    date: string;
    name: string;
    time: string;
  };
  dateOfTransaction: string;
  documents: string[];
  formMode: string;
  id: number;
  instrumentName: string;
  investedWith: string;
  lastUpdatedBy: {
    date: string;
    name: string;
    time: string;
  };  
  loanGrantedBy: string;
  notes: string;
  numberOfShares: number,
  shareholder: string;
  transferee: string;
  typeOfTransaction: string;
  value: {
    currency: string;
    total: number;
  }
};
export interface ITransactionType {
  text:
    | TransactionTypes.BUYBACK
    | TransactionTypes.CANCELLATION
    | TransactionTypes.ISSUANCE
    | TransactionTypes.TRANSFER;
  value: number;
}

// Types
export type TConvertAPIShareholderToDropdownValues = (shareholders: IShareholder[]) => {
  text: string;
  value: number;
}[];
export type TDeleteCapitalRegisterById = (id: number) => void;
export type TEditCapitalRegister = (props: ICapitalRegister) => void;
export type TInstrumentNames = {
  text: string;
  type?: string;
  value: number | string;
}[];
export type TRenderFormForSelection = (transactionType: string, instrumentType: string) => React.ReactElement;
export type TShareholders = ISelect["items"];
