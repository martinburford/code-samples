import classnames from 'classnames/bind';
import React from 'react';

// Components
import Icon from 'components/ui/atoms/icon';

// Scripts
import { buildDataAttributes } from 'scripts/utilities';

// Styles
import styles from './select.module.scss';

// Types
import { ISelect } from './types/select.types';

export const Select: React.FC<ISelect> = ({
  colour = 'gray',
  dataAttributes = {},
  disabled,
  id,
  items,
  label,
  multiSelect,
  placeholder,
  singleSelect,
}) => {
  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = classnames.bind(styles);
  const classes = cx({
    [colour]: true,
    select: true,
  });

  const selectWrapperDataAttributes = {};
  const selectAttributes = {};

  // Is the dropdown list disabled?
  if (disabled) {
    selectWrapperDataAttributes['data-is-disabled'] = true;
    selectAttributes['disabled'] = true;
  }

  // Is the dropdown list single select?
  if (singleSelect) {
    selectWrapperDataAttributes['data-is-single'] = true;
  }

  // Is the dropdown list multi-select?
  if (multiSelect) {
    selectWrapperDataAttributes['data-is-multiple'] = true;
    selectAttributes['multiple'] = true;
  }

  return (
    <div {...buildDataAttributes('select', dataAttributes)}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <div className={classes} {...selectWrapperDataAttributes}>
        <select className={styles['select-list']} id={id} {...selectAttributes} placeholder={placeholder}>
          {singleSelect && (
            <option value="" disabled selected>
              {placeholder}
            </option>
          )}
          {items.map((item, index) => {
            const { selected, text, value } = item;
            const optionAttributes = {};

            // Does the option need to be pre-populated?
            if (selected) {
              optionAttributes['selected'] = true;
            }

            return (
              <option key={`select-${id}-option-${index + 1}`} value={value} {...optionAttributes}>
                {text}
              </option>
            );
          })}
        </select>
        <Icon colour="gray" id="arrowRight" />
        <span className={styles.focus}></span>
      </div>
    </div>
  );
};

export default Select;
