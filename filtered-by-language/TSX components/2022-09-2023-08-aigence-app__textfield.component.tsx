// Components
import FormHelp from "@aigence/components/molecules/form-help";
import Icon from "@aigence/components/atoms/icon";

// NPM imports
import classnames from "classnames/bind";
import { forwardRef, Ref, useEffect, useState } from "react";
import AnimateHeight from "react-animate-height";
import Skeleton from "react-loading-skeleton";

// Scripts
import { TRANSITION_MEDIUM } from "@aigence/scripts/consts";
import { buildDataAttributes, validateNumberInput } from "@aigence/scripts/utilities";

// Styles
import styles from "./textfield.module.scss";

// Types
import { EColours, ESizes } from "@aigence/types/enums";
import { ITextfield } from "./types/textfield.types";

export const Textfield = forwardRef(
  (
    {
      dataAttributes = {},
      disabled = false,
      hasError = false,
      help = { showOnError: false, text: "" },
      label,
      loading = false,
      maxLength,
      name,
      onChange,
      onClick,
      onEnter,
      onFocus,
      onKeyUp = null,
      placeholder,
      prefix,
      readonly = false,
      suffix,
      type = "text",
      value = "",
      ...rest
    }: ITextfield,
    ref: Ref<HTMLInputElement>
  ) => {
    // Hooks (effects)
    useEffect(() => {
      if (helpShowOnError) {
        updateHelpHeight(hasError ? "auto" : 0);
      }
    }, [hasError]);

    // Hooks (state)
    const [helpHeight, updateHelpHeight] = useState<"auto" | number>(0);

    // De-structuring
    const { showOnError: helpShowOnError, text: helpText } = help;

    // Bind classnames to the components CSS module object in order to access its modular styles
    const cx = classnames.bind(styles);
    const classes = cx({
      "additional-content": prefix || suffix,
      disabled,
      "has-error": hasError,
      number: type === "number",
      readonly,
      textfield: true,
    });

    // Should prefix and suffix elements by added to the textfield?
    const prefixElem = prefix ? <div className={styles.prefix}>{prefix}</div> : null;
    const suffixElem = suffix ? <div className={styles.suffix}>{suffix}</div> : null;

    // Is a label required?
    const labelElem = label ? (
      <div className={styles["label-outer"]}>
        <label className={styles.label} htmlFor={name}>
          {label}
        </label>
        {/* If any help text was provided? */}
        {helpText && <Icon colour={EColours.BLUE} eventStopPropagation={false} id="informationCircle" onClick={() => updateHelpHeight(helpHeight === 0 ? "auto" : 0)} size={ESizes.XS} />}
      </div>
    ) : null;

    // Handle the onKeyUp event of the input field
    const onKeyUpHandler = ({ key, target }) => {
      // Should any custom functionality be performed when the user presses the enter key on the keyboard?
      if (onEnter) {
        if (key === "Enter") {
          onEnter(target.value);
        }
      }
    };

    return (
      <div className={classes} {...buildDataAttributes("textfield", dataAttributes)}>
        {labelElem}
        <div className={styles.outer}>
          {loading ? (
            <Skeleton containerClassName="skeleton-full-width" />
          ) : (
            <>
              {prefixElem}
              <input
                {...rest}
                autoComplete="off"
                className={styles.input}
                defaultValue={value}
                id={name}
                maxLength={maxLength}
                name={name}
                onChange={(e) => {
                  if (onChange) {
                    onChange(e);
                  }
                }}
                onClickCapture={(e) => {
                  if (onClick) {
                    onClick(e);
                  }
                }}
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
                ref={ref}
                type={type}
              />
              {suffixElem}
            </>
          )}
        </div>
        <AnimateHeight duration={TRANSITION_MEDIUM} height={helpHeight}>
          <FormHelp message={helpText} />
        </AnimateHeight>
      </div>
    );
  }
);

Textfield.displayName = "Textfield";

export default Textfield;
