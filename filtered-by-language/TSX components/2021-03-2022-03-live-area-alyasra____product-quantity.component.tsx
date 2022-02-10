import React, { useEffect, useState } from 'react';

// Components
import Button from 'components/ui/atoms/button';
import Textfield from 'components/ui/atoms/textfield';

// Scripts
import { buildDataAttributes } from 'scripts/utilities';

// Styles
import styles from './product-quantity.module.scss';

// Types
import { IProductQuantity } from './types/product-quantity.types';

export const ProductQuantity: React.FC<IProductQuantity> = ({ dataAttributes = {}, maximum, quantity = 0 }) => {
  // Hooks
  const [state, updateState] = useState(0);

  // If an initial quantity is provided, save it
  useEffect(() => {
    if (quantity) {
      updateState(quantity);
    }
  }, []);

  /**
   * @function changeQuantity - Either increment or decrement the quantity
   * @param {string} type - Either 'less' || 'more
   */
  const changeQuantity = type => {
    if (type === 'less' && state === 0) return;
    if (type == 'more' && maximum) {
      if (state + 1 > maximum) return;
    }

    const newQuantity = type === 'less' ? state - 1 : state + 1;

    updateState(newQuantity);
  };

  // Are the "-" and or "+" elements of the component locked?
  // Re-define locked flags upon each quantity change
  const lockedAttribute = {
    'data-locked-minus': false,
    'data-locked-plus': false,
  };

  if (state === 0) {
    lockedAttribute['data-locked-minus'] = true;
  }

  if (maximum && state === maximum) {
    lockedAttribute['data-locked-plus'] = true;
  }

  // Is the product available or not Re: stock availability
  const quantityElem =
    quantity > -1 ? (
      <>
        <span
          className={styles.less}
          data-locked-minus={lockedAttribute['data-locked-minus']}
          onClick={() => changeQuantity('less')}
        >
          -
        </span>
        <span className={styles.quantity}>
          <Textfield
            background="white"
            name="product-quantity-textfield"
            placeholder="Quantity"
            liveValue={state.toString()}
            readonly={true}
          />
        </span>
        <span
          className={styles.more}
          data-locked-plus={lockedAttribute['data-locked-plus']}
          onClick={() => changeQuantity('more')}
        >
          +
        </span>
      </>
    ) : (
      <Button disabled={true} variant="primary">
        Out of stock
      </Button>
    );

  return (
    <div className={styles['product-quantity']} {...buildDataAttributes('product-quantity', dataAttributes)}>
      {quantityElem}
    </div>
  );
};

export default ProductQuantity;
