// @ts-nocheck
import Classnames from "classnames/bind";
import React, { useEffect, useRef } from "react";

// Components
import Spinner from "../../spinner";

// Styles
import "../form.scss";
import styles from "./select.module.scss";

// Types
import { ISelect, ISelectAttributes } from "./select.types";

export const Select: React.FC<ISelect> = ({
  data,
  disabled = false,
  error,
  form,
  input: { name, onChange, value },
  loading,
  touched = false,
  onSelect,
  placeholder,
  required = false,
  selected
}) => {
  // Setup a ref to the <select> DOM element
  const selectRef = useRef<HTMLSelectElement>(null);

  // Set the selectedIndex equal to the selected property value
  useEffect(() => {
    if (selected) {
      // Find the item which has the value matching that passed as the "selected" property
      const selectedIndex = Array.from(selectRef.current!.options).findIndex((option) => option.value == selected);

      // Only if a valid item has been selected should the form value also be updated, otherwise it should remain on -1, which would mean the field is not selected when it's mandatory
      if (selectedIndex !== -1) {
        // Set the selectedIndex, both visually AND in terms of the container react-final-form <form> element
        if (form) {
          form!.change(`${name}`, selected);
        }

        selectRef.current!.selectedIndex = selectedIndex;
      }
    }
  }, [selected]);

  // Custom data attributes to flag multiple states of the form element
  const formItemDataAttributes = {
    "data-form-item": true,
    "data-form-item-error": touched && error,
    "data-form-item-required": required
  };

  // Are there any potential custom attributes to add?
  const selectAttributes: ISelectAttributes = {};

  // Should the dropdown be disabled?
  const isDisabled = data.length === 0 || disabled;

  if (isDisabled) {
    selectAttributes.disabled = true;
  }

  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = Classnames.bind(styles);
  const classnames = cx({
    select: true,
    disabled: isDisabled
  });

  return (
    <>
      <div {...formItemDataAttributes}>
        <div className={classnames}>
          <label htmlFor={name}>
            <select
              id={name}
              required
              value={value}
              onChange={(e) => {
                // If there's logic to execute upon the selection of a dropdown item, execute it here, passing the value of the selected item
                if (onSelect) {
                  onSelect(parseInt(e.target.value));
                }

                // Perform the regular onChange handler regardless
                onChange(e);
              }}
              ref={selectRef}
              {...selectAttributes}
            >
              {placeholder && <option disabled value="">{`${placeholder}${required ? " *" : ""}`}</option>}
              {data.map((item, index) => (
                <option key={`${name}-list-item-${index}`} value={item.value}>
                  {item.text}
                </option>
              ))}
            </select>
          </label>
          {loading && (
            <div className={styles.spinner}>
              <Spinner color="stone" size="medium" />
            </div>
          )}
        </div>
      </div>
      {touched && error && <div data-form-error-message>{error}</div>}
    </>
  );
};

export default Select;
