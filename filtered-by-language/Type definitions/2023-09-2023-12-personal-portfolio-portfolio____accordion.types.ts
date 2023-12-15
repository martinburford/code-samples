// Type imports
import { IToggleBlock } from "components/organisms/toggle-block/types/toggle-block.types";
import { IDataAttributes } from "types/interfaces";

// Interfaces
export interface IAccordion extends IDataAttributes {
  /** Are multiple groups allowed to be open at once? */
  allowMultipleExpanded?: boolean;
  /** A list of toggle-able content blocks */
  items: {
    [Property in keyof TToggleBlock]: TToggleBlock[Property];
  }[];
}

// Types
type TToggleBlock = Pick<IToggleBlock, "content" | "header" | "onToggle"> & {
  /** Whether or not the toggle block item should be automatically expanded or not */
  expanded?: boolean;
}
