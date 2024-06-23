// Types
import { EColours, ESizes } from "types/enums";
import { IClassName, IDataAttributes } from "types/interfaces";
import { pickEnum } from "types/types";

// Interfaces
export interface IIcon extends IClassName, IDataAttributes {
  /** Available icon colors */
  colour?: TIconColors;
  /** Should the icon be disabled or not? */
  disabled?: boolean;
  /** Should the event stop propagation? */
  eventStopPropagation?: boolean;
  /** Should an increased gutter be added to surround the icon? */
  expandedHitArea?: ESizes;
  /** The unique icon identifier */
  id: TAppIds | TOtherIds;
  /** The functionality to execute when clicking an icon */
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => any;
  /** The size of the icon */
  size?: ESizes;
}

// Types
export type TAppIds =
  | "excel"
  | "financialTimes"
  | "oneDrive"
  | "outlook"
  | "salesforce"
  | "teams"
  | "vivaEngage"
  | "word"
  | "workday";
export type TIconColors = pickEnum<
  EColours,
  | EColours.BASE_BLACK
  | EColours.BASE_BLUE_MID
  | EColours.BASE_GRAY
  | EColours.BASE_GREEN
  | EColours.BASE_SALMON
  | EColours.BASE_VIOLET
  | EColours.BASE_YELLOW
  | EColours.BASE_WHITE
>;
export type TIconIds = Pick<IIcon, "id">;
export type TOtherIds =
  | "arrowDown"
  | "arrowLeft"
  | "arrowRight"
  | "arrowRightFilled"
  | "arrowRightWithTail"
  | "arrowUp"
  | "bell"
  | "calendar"
  | "calendarColoured"
  | "chatBubble"
  | "chevron"
  | "circleTick"
  | "code"
  | "copy"
  | "file"
  | "first"
  | "home"
  | "information"
  | "last"
  | "linkedIn"
  | "npm"
  | "plusCircle"
  | "people"
  | "search"
  | "tick"
  | "video"
  | "videoColoured"
  | "x";
