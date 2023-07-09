// NPM imports
import { DateObject } from "react-multi-date-picker";

// Type imports
import { ColDef } from "ag-grid-enterprise";

// Interfaces
export interface IColDef extends ColDef {
  externalFilter?: "datepicker" | "list" | "text";
}

export interface IDataAttributes {
  /** Custom data attributes, to provide unique identifiers for components when required */
  dataAttributes?:
    | {
        [key: string]: string | number;
      }
    | undefined;
}

export interface IBreakpoints {
  /** The breakpoints supported in the application */
  breakpoints: {
    [key: string]: number;
  };
  /** The current breakpoint */
  currentBreakpoint: "mobile" | "tabletPortrait" | "tabletLandscape" | "desktop" | "widescreen" | "debug";
}

export interface IDatePickers {
  [key: string]: DateObject | DateObject[] | string[] | string | null;
}

export interface IDynamicObject {
  [key: string]: any;
}

export interface IForm {
  /** The unique identifier of a form (required for the external submit button) */
  formId: string;
  /** The types of forms available throughout the site */
  mode: "add" | "edit" | "view";
}

export interface IItemsPerRow<TMobile = 1 | 2 | 3, TTablet = 1 | 2 | 3, TDesktop = 1 | 2 | 3 | 4 | 5 | 6> {
  /** How many items per row should be shown? */
  itemsPerRow?: {
    mobile: TMobile;
    tablet: TTablet;
    desktop: TDesktop;
  };
}