import classnames from 'classnames/bind';
import React from 'react';

// Scripts
import { buildDataAttributes } from 'scripts/utilities';

// Styles
import styles from './item-listings-vertical.module.scss';

// Types
import { IItemListingsVertical } from './types/item-listings-vertical.types';

export const ItemListingsVertical: React.FC<IItemListingsVertical> = ({
  dataAttributes = {},
  items,
  itemsPerRow = {
    mobile: 2,
    tablet: 2,
    desktop: 2,
  },
  scrollable,
}) => {
  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = classnames.bind(styles);
  const classes = cx({
    [`desktop-per-row-${itemsPerRow.desktop}`]: true,
    [`mobile-per-row-${itemsPerRow.mobile}`]: true,
    'item-listings-vertical': true,
    scrollable: scrollable,
    [`tablet-per-row-${itemsPerRow.tablet}`]: true,
  });

  return (
    <div className={classes} {...buildDataAttributes('item-listings-vertical', dataAttributes)} data-view-mode="grid">
      <div className={styles.outer}>
        {items.map((item, index) => {
          return (
            <div key={index} data-component-id="item-listing-vertical">
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ItemListingsVertical;
