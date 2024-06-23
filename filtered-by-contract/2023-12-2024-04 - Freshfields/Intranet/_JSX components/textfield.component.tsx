// NPM imports
import classnames from "classnames/bind";
import React from "react";

// Scripts
import { buildDataAttributes, validateNumberInput } from "scripts/utilities";

// Styles
import styles from "./textfield.module.scss";

// Types
import { ITextfield, TOnKeyUpHandler } from "./types/textfield.types";

export const Textfield: React.FC<ITextfield> = ({
  className,
  dataAttributes = {},
  disabled = false,
  label,
  maxLength,
  name,
  onEnter,
  onFocus,
  onKeyUp = null,
  placeholder,
  prefix,
  readonly = false,
  suffix,
  type = "text",
  value = "",
}) => {
  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = classnames.bind(styles);
  let classes = cx({
    "additional-content": prefix || suffix,
    disabled,
    number: type === "number",
    readonly,
    textfield: true,
  });

  // Do custom utility classes need to be added?
  if(className) classes += ` ${className}`;

  // Should prefix and suffix elements by added to the textfield?
  const prefixElem = prefix ? <div className={styles.prefix}>{prefix}</div> : null;
  const suffixElem = suffix ? <div className={styles.suffix}>{suffix}</div> : null;

  // Is a label required?
  const labelElem = label ? (
    <div className={styles["label-outer"]} onMouseDown={(e) => e.preventDefault()}>
      <label className={styles.label} htmlFor={name}>
        {label}
      </label>
    </div>
  ) : null;

  // Handle the onKeyUp event of the input field
  const onKeyUpHandler: TOnKeyUpHandler = ({ key, target }) => {
    // Should any custom functionality be performed when the user presses the enter key on the keyboard?
    if (onEnter) {
      if (key === "Enter") {
        onEnter((target as HTMLInputElement).value);
      }
    }
  };

  return (
    <div className={classes} {...buildDataAttributes("textfield", dataAttributes)}>
      {labelElem}
      <div className={styles.outer}>
        <>
          {prefixElem}
          <input
            autoComplete="off"
            className={styles.input}
            defaultValue={value}
            id={name}
            maxLength={maxLength}
            name={name}
            onFocusCapture={() => {
              if (onFocus) {
                onFocus();
              }
            }}
            onKeyDown={(e) => {
              if (type === "number") {
                if (!validateNumberInput(e)) {
                  e.preventDefault();
                }
              }
            }}
            onKeyUp={(e) => {
              onKeyUpHandler(e);

              // Execute a custom keyUp handler if it was provided
              if (onKeyUp) {
                onKeyUp(e.currentTarget.value);
              }
            }}
            placeholder={placeholder}
            readOnly={disabled || readonly}
            type={type}
          />
          {suffixElem}
        </>
      </div>
    </div>
  );
};

export default Textfield;
