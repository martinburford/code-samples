// NPM imports
import React from "react";

// Type imports
import { IClassName, IDataAttributes } from "types/interfaces";

// Interfaces
export interface IButton extends IClassName, IDataAttributes {
  /** The children nodes */
  children: string | React.ReactElement;
  /** Whether the button is a compact (reduced padding) button or not */
  compact?: boolean;
  /** Whether the button is disabled or not */
  disabled?: boolean;
  /** Should the event stop propagation? */
  eventStopPropagation?: boolean;
  /** Should the button have no theme styling, and just be a regular (non-gradient)? */
  // hasNoTheme?: boolean;
  /** Functionality to execute whenever the button is clicked */
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  /** A prefix icon to prepend to the inner content of the button */
  prefixIcon?: React.ReactElement;
  /** A suffix icon to prepend to the inner content of the button */
  suffixIcon?: React.ReactElement;
  /** Which custom style of button to render (other than the default) */
  variant?: "default" | "error" | "primary" | "success";
}

// Types
// ...
