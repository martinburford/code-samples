// Components
import Icon from "components/atoms/icon";

// NPM imports
import classnames from "classnames/bind";
import React from "react";

// Scripts
import { buildDataAttributes } from "scripts/utilities";

// Styles
import styles from "./select.module.scss";

// Types
import { ISelect, TOnChangeHandler } from "./types/select.types";
import { EColours, ESizes } from "types/enums";
import { IDynamicObject } from "types/interfaces";

export const Select: React.FC<ISelect> = ({
  className,
  dataAttributes = {},
  disabled,
  fullWidth,
  id,
  items,
  label,
  onChange,
  placeholder,
}) => {
  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = classnames.bind(styles);
  let outerClasses = cx({
    "full-width": fullWidth,
    "select-outer": true,
  });
  const classes = cx({
    "full-width": fullWidth,
    select: true,
  });

  // Do custom utility classes need to be added?
  if(className) outerClasses += ` ${className}`;

  const selectWrapperDataAttributes: IDynamicObject = {};
  const selectAttributes: IDynamicObject = {};

  // Is the dropdown list disabled?
  if (disabled) {
    selectWrapperDataAttributes["data-is-disabled"] = true;
    selectAttributes["disabled"] = true;
  }

  // Find any selected values (for pre-population)
  // If there aren't any, the placeholder text will by default be selected (via defaultValue)
  const selectedItem = items.find((item) => item.selected);
  selectAttributes["defaultValue"] = selectedItem !== undefined ? selectedItem.value : -1;

  // Is a label required?
  const labelElem = label ? (
    <div className={styles["label-outer"]}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
    </div>
  ) : null;

  // Execute this functionality whenever the dropdown list value is changed
  const onChangeHandler: TOnChangeHandler = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={outerClasses} {...buildDataAttributes("select", dataAttributes)}>
      {labelElem}
      <div className={classes} {...selectWrapperDataAttributes}>
        <select {...selectAttributes} className={styles["select-list"]} id={id} name={id} onChange={onChangeHandler}>
          <option value="">{placeholder}</option>
          {items.map((item, index) => {
            const { text, value } = item;

            return (
              <option key={`select-${id}-option-${index + 1}`} value={value}>
                {text}
              </option>
            );
          })}
        </select>
        <Icon colour={EColours.BASE_GRAY} id="arrowDown" size={ESizes.XS} />
        <span className={styles.focus}></span>
      </div>
    </div>
  );
};

export default Select;
