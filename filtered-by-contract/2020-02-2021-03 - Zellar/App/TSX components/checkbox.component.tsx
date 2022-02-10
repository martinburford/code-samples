import Classnames from "classnames/bind";
import React from "react";
import { useDispatch } from "react-redux";

// Components
import { actions } from "../../../../../store";
import Icon from "../../icon";

// Styles
import "../form.scss";
import styles from "./checkbox.module.scss";

// Types
import { ICheckbox } from "./checkbox.types";

export const Checkbox: React.FC<ICheckbox> = ({
  checked,
  dataAttributes,
  error,
  input: { name, onChange },
  label,
  reduxChangeAction,
  required = false,
  size,
  touched
}) => {
  // Dispatch actions to Redux
  const dispatch = useDispatch();

  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = Classnames.bind(styles);
  const classnames = cx({
    checkbox: true,
    checked,
    large: size == "large",
    small: size == "small"
  });

  // Should a tick be visible or not?
  const tickElem = checked ? <Icon id="tick" /> : null;

  // Custom data attributes to flag multiple states of the form element
  const formItemDataAttributes = {
    "data-checkbox-size": size,
    "data-form-item": true,
    "data-form-item-checkbox": true,
    "data-form-item-error": touched && error,
    "data-form-item-required": required
  };

  return (
    <label className={classnames} {...formItemDataAttributes}>
      <input
        checked={checked}
        className={styles.input}
        id={name}
        name={name}
        type="checkbox"
        {...dataAttributes}
        onChange={(e) => {
          e.preventDefault();

          if (onChange) {
            onChange(e);

            // Is there a Redux action to dispatch in response to the checked state changing?
            if (reduxChangeAction) {
              // Save the current consent checked state to Redux
              const currentCheckedState = (e.target as HTMLInputElement).checked;
              const [reducer, action] = reduxChangeAction.split(".");

              dispatch(actions[reducer][action](currentCheckedState));
            }
          }
        }}
      />
      <div className={styles["styled-tick"]} data-selector="checkbox">
        {tickElem}
      </div>
      <div className={styles.label}>{label}</div>
      {touched && error && <div data-form-error-message>{error}</div>}
    </label>
  );
};

export default React.memo(Checkbox);
