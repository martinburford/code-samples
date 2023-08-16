// NPM imports
import React from "react";

// Type imports
import { IDataAttributes } from "@aigence/types/interfaces";

// Interfaces
export interface ITextfield extends IDataAttributes {
  /** Whether the field is disabled or not */
  disabled?: boolean;
  /** Does the textfield have an error? */
  hasError?: boolean;
  /** Is there any help text to show for the textfield? */
  help?: {
    showOnError?: boolean;
    text: string;
  };
  /** The label to show above the textfield */
  label?: string;
  /** Is the component currently awaiting data? */
  loading?: boolean;
  /** The maximum number of characters allowed in the textfield */
  maxLength?: number;
  /** The unique name of the textfield */
  name: string;
  /** For DatePicker, when the textfields values changes (by a selection), handle the date change event */
  onChange?: (e: React.FormEvent<HTMLInputElement>) => void;
  /** For DatePicker, when the textfield receives focus, it needs to show the date picker */
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  /** Should any custom functionality be performed when the user presses the enter key on the keyboard? */
  onEnter?: (value: string) => void;
  /** Should any custom functionality be performed when the user focuses on the textfield? */
  onFocus?: () => void;
  /** Should any custom functionality be performed when the user presses any on the keyboard? eg: live searches */
  onKeyUp?: (value: string) => void;
  /** The default placeholder text */
  placeholder: string;
  /** Is there any prefix content before the textfield? */
  prefix?: React.ReactNode;
  /** Should the textfield field be readonly? */
  readonly?: boolean;
  /** Is there any suffix content after the textfield? */
  suffix?: React.ReactNode;
  /** What type of input should be permitted? */
  type?: "number" | "text";
  /** Requried by <DatePicker> in order to provide a live value bound to the picker */
  value?: string;
}

// Types
// ...
