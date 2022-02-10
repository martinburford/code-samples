import React, { useState } from "react";

// Components
import IconList from "../../icon-list";

// Styles
import "../form.scss";
import styles from "./password.module.scss";
import textboxSyles from "../textbox/textbox.module.scss";

// Types
import { IPasswordRules, IUseState, TIsValidPassword } from "./password.types";
import { ITextbox } from "../textbox/textbox.types";

// Functional component for showing the ticks and crosses, indicating the validity checks against the password
const PasswordRules: React.FC<IPasswordRules> = ({ password }) => {
  const hasLowerCase = password.toUpperCase() != password;
  const hasNumber = /\d/.test(password);
  const hasUpperCase = password.toLowerCase() != password;
  const minimum8Characters = password.length >= 8;

  // Which icons should be returned in regards to the validity of the password criteria?
  const invalid = <img src="/assets/svgs/icons/cross-filled.svg" data-selector="icon-list-icon" />;
  const valid = <img src="/assets/svgs/icons/tick-filled.svg" data-selector="icon-list-icon" />;

  return (
    <IconList
      columns={2}
      indent="m"
      items={[
        {
          icon: hasUpperCase ? valid : invalid,
          text: "Uppercase letter"
        },
        {
          icon: hasLowerCase ? valid : invalid,
          text: "Lower case letter"
        },
        {
          icon: minimum8Characters ? valid : invalid,
          text: "At least 8 characters"
        },
        {
          icon: hasNumber ? valid : invalid,
          text: "Number"
        }
      ]}
      noTopMargin={true}
    />
  );
};

/**
 * @function isValidPassword
 * Is the entered password valid?
 * @param {string} password - The password entered by the user and the one to check
 * @returns {boolean} - Whether or not the password meets the required criteria?
 **/
export const isValidPassword: TIsValidPassword = (password) => {
  const hasNumber = /\d/.test(password);
  const hasLowerCase = password.toUpperCase() != password;
  const hasUpperCase = password.toLowerCase() != password;
  const minimum8Characters = password.length >= 8;

  return hasLowerCase && hasNumber && hasUpperCase && minimum8Characters;
};

export const Password: React.FC<ITextbox> = ({
  touched,
  input: { name, onChange, value },
  placeholder,
  required = false,
  type
}) => {
  const [state, updateState] = useState<IUseState>({
    visible: type === "text"
  });

  // Custom data attributes to flag multiple states of the form element
  const formItemDataAttributes = {
    "data-form-item": true,
    "data-form-item-error": touched && !isValidPassword("" + value),
    "data-form-item-password": true,
    "data-form-item-required": required
  };

  // Handle the "Show / hide" toggle being clicked, switching the field from "text" to "password"
  const onToggleShowHide = () => updateState({ visible: !state.visible });

  return (
    <>
      <div {...formItemDataAttributes}>
        <input
          className={textboxSyles.textbox}
          name={name}
          onChange={onChange}
          placeholder={`${placeholder}${required ? " *" : ""}`}
          type={state.visible ? "text" : "password"}
          value={value}
        />
        <a className={styles["show-hide"]} onClick={onToggleShowHide}>
          {state.visible ? "Hide" : "Show"}
        </a>
      </div>
      <br />
      <PasswordRules password={"" + value} />
    </>
  );
};

export default Password;
