// NPM imports
import React from "react";

// Type imports
import { ECategory } from "@aigence/types/enums";
import { IDataAttributes, IDynamicObject } from "@aigence/types/interfaces";

// Interfaces
export interface IHeading {
  align?: "center" | "char" | "justify" | "left" | "right";
  sortable?: boolean;
  text: string;
  width?: number;
}
export interface IDataTable extends IDataAttributes {
  /** Whether or not the colour of every other table row should differ */
  alternatingRowBackground?: boolean;
  /** The category of page that the data table belongs too */
  category: ECategory;
  /** Should the table render cells with reduced padding? */
  compact?: boolean;
  /** Is there any footer content to show under the table? */
  footer?: React.ReactNode;
  /** Whether or not the table rows show a new background colour when being hovered */
  hasHoverRowBackground?: boolean;
  /** Whether or not the left edge should have a category-specific border showing */
  hasLeftEdge?: boolean;
  /** Does the DataTable have an external Pagination component controlling it? */
  hasLinkedPagination?: boolean;
  /** The row highlight colour to show when hovering over them */
  hoverRowBackgroundColour?: ECategory;
  /** The is the data tables data currently loading (being fetched from the API)? */
  loading?: boolean;
  /** The number of rows to show when rendering a skeleton table body */
  loadingRows?: number;
  /** The data for the tables rows */
  rows: {
    data: {
      formatted: React.ReactNode;
      meta?: IDynamicObject;
      raw?: string | number | boolean;
    }[];
    onToggle?: (e: React.MouseEventHandler<HTMLTableRowElement>) => void;
    pulse?: boolean;
    selected?: boolean;
    suffixRow?: React.ReactNode;
  }[];
  /** The table headings */
  headings: IHeading[];
  /** The theme of the tables styles */
  theme?: "bubble" | "default" | "stroke";
  /** How should the content inside a row align? */
  verticalRowAlignment?: "centre" | "top";
}

// Types
export type TConstructTableBody = (isLoading: boolean) => React.ReactElement[];
export type TFlushPulseProperty = (data: IDataTable["rows"]) => IDataTable["rows"];
export type TRows = Pick<IDataTable, "rows">;
export type TOnSortTable = (e: React.MouseEvent<HTMLDivElement>, headingUnformatted: string) => void;
export type TToggleSuffixRow = (e: React.ChangeEvent<HTMLDivElement>) => void;
