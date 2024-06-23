// Type imports
import { IRow } from "components/atoms/row/types/row.types";

export interface IBackground {
  /** The background of the component or webpart, which can be either a hex code or a colour name eg: "#ff0000", "red". Please note: this should only be specified when a webpart is set to run as stretchToFit=false (centralized) */
  background?: string;
}

export interface IClassName {
  /** A string of optional classes which can be provided to ALL components. Use "mt" "mr" "mb" and "ml" for margin top, right, bottom and left. Value of 5, 10, 15, 20, 25, 30 and 35 can be used. Multiple values can be passed as a concatenated string eg: eg: "mt-5 mr-15 mb-25 ml-35" */
  className?: string;
}

export interface IDataAttributes {
  /** Custom data attributes, to provide unique identifiers for components when required */
  dataAttributes?:
    | {
        [key: string]: string;
      }
    | undefined;
}

export interface IDynamicObject {
  [key: number | string]: any;
}

export interface IWebpart extends IBackground, Pick<IRow, "stretchToFit"> {
  /** Is the webpart fetching data? */
  loading?: boolean;
}
