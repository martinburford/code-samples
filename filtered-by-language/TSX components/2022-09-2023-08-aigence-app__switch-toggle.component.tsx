// Components
import FormHelp from "@aigence/components/molecules/form-help";
import Icon from "@aigence/components/atoms/icon";

// NPM imports
import classnames from "classnames/bind";
import { useEffect, useState } from "react";
import AnimateHeight from "react-animate-height";

// Scripts
import { TRANSITION_MEDIUM } from "@aigence/scripts/consts";
import { buildDataAttributes } from "@aigence/scripts/utilities";

// Styles
import styles from "./switch-toggle.module.scss";

// Types
import { EColours, ESizes } from "@aigence/types/enums";
import { ISwitchToggle } from "./types/switch-toggle.types";

export const SwitchToggle: React.FC<ISwitchToggle> = ({
  active = false,
  colour = EColours.GREEN,
  dataAttributes = {},
  formValidationRegister,
  hasError = false,
  help = { showOnError: false, text: "" },
  id,
  label,
  onChange = null,
  size = "large",
}) => {
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
    active,
    [colour]: true,
    "has-error": hasError,
    [size]: true,
    "switch-toggle": true,
  });

  return (
    <div className={classes} {...buildDataAttributes("switch-toggle", dataAttributes)}>
      <div className={styles.outer}>
        <label className={styles["toggle-wrapper"]} htmlFor={id}>
          <input
            checked={active}
            className={styles.input}
            id={id}
            name={id}
            onChange={(e) => {
              onChange((e.target as HTMLInputElement).checked);
            }}
            type="checkbox"
            {...formValidationRegister}
          />
          <span className={styles.handle}>Toggle</span>
        </label>
        {label && (
          <div className={styles["label-wrapper"]}>
            <label className={styles.label} htmlFor={id}>
              {label}
            </label>
            {/* If any help text was provided? */}
            {helpText && (
              <Icon
                colour={EColours.BLUE}
                eventStopPropagation={false}
                id="informationCircle"
                onClick={() => updateHelpHeight(helpHeight === 0 ? "auto" : 0)}
                size={ESizes.XS}
              />
            )}
          </div>
        )}
      </div>
      <AnimateHeight duration={TRANSITION_MEDIUM} height={helpHeight}>
        <FormHelp message={helpText} />
      </AnimateHeight>
    </div>
  );
};

export default SwitchToggle;
