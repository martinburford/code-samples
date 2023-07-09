// Types
import { IDataAttributes } from 'components/ui/global/types';

export interface ISelect extends IDataAttributes {
  /** The colour of the icon */
  colour?: 'gray' | 'green' | 'maroon' | 'orange' | 'purple' | 'tan' | 'teal';
  /** Is the dropdown list disabled? */
  disabled?: boolean;
  /** The unique id for the dropdown */
  id: string;
  /** The dropdown lists options */
  items: {
    selected?: boolean;
    text: string;
    value: number | string;
  }[];
  /** The label text to show above the dropdown list */
  label?: string;
  /** The placeholder text to show within the dropdown list */
  placeholder?: string;
  /** Whether the dropdown accepts only a single selection or not */
  singleSelect?: boolean;
  /** Whether the dropdown accepts multiple selections or not */
  multiSelect?: boolean;
}

// Todo: add "selected" prop to the items object (each item)
