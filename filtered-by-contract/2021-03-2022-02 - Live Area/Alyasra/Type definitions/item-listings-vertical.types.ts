import React from 'react';

// Types
import { IDataAttributes } from 'components/ui/global/types';

export interface IItemsPerRow {
  /** How many items per row should be shown? */
  itemsPerRow?: {
    mobile: 2 | 3;
    tablet: 2 | 3;
    desktop: 2 | 3 | 4 | 5 | 6;
  };
}

export interface IItemListingsVertical extends IDataAttributes, IItemsPerRow {
  /** The collection of items to be shown */
  items: React.ReactElement[];
  /** Whether or not the products should scroll if more than 3 are provided */
  scrollable?: boolean;
}
