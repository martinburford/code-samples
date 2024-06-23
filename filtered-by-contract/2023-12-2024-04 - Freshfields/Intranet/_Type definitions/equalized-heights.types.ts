// NPM imports
import React from "react";

// Type imports
import { EColours, ESizes } from "types/enums";
import { IClassName, IDataAttributes } from "types/interfaces";
import { pickEnum } from "types/types";

// Interfaces
export interface IEqualizedHeights extends IClassName, IDataAttributes {
  /** The available colours for the background */
  backgroundColour?: TBackgroundColours | "none";
  /** The children nodes */
  children: React.ReactNode[];
  /** The horizontal spacing between columns */
  columnGap?: ESizes | 0;
  /** The internal padding of each column */
  columnPadding?: ESizes | 0;
  /** Should the items equalize on each row OR all items regardless of rows */
  equalizeByRow?: boolean;
  /** How many items per row should be shown? */
  itemsPerRow?: {
    mobile: 1;
    tablet: 1 | 2 | 3 | 4 | 5;
    desktop: 1 | 2 | 3 | 4 | 5;
  };
  /** The vertical spacing between rows */
  rowGap?: ESizes | 0;
  /** Should horizontal separator lines divide the columns? */
  showSeparatorLines?: boolean;
}

// Types
type TBackgroundColours = pickEnum<
  EColours,
  | EColours.BASE_BLUE_MID
  | EColours.BASE_GRAY
  | EColours.BASE_GREEN
  | EColours.BASE_SALMON
  | EColours.BASE_VIOLET
  | EColours.BASE_WHITE
  | EColours.BASE_YELLOW
>;
