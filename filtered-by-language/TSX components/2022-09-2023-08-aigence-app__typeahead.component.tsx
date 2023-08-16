// Components
import Card from "@aigence/components/atoms/card";
import Icon from "@aigence/components/atoms/icon";
import Scroller from "@aigence/components/atoms/scroller";
import Textfield from "@aigence/components/atoms/textfield";

// NPM imports
import classnames from "classnames/bind";
import { useEffect, useRef, useState } from "react";

// Scripts
import { useOnClickOutside } from "@aigence/scripts/hooks/useOnClickOutside";
import { buildDataAttributes } from "@aigence/scripts/utilities";

// Styles
import styles from "./typeahead.module.scss";

// Types
import { ITypeahead, TSetNewValue } from "./types/typeahead.types";
import { ESizes } from "@aigence/types/enums";

export const Typeahead: React.FC<ITypeahead> = ({
  compact,
  dataAttributes = {},
  defaultValue,
  disabled,
  formValidationRegister,
  hasError,
  help = {
    text: "",
  },
  items,
  label,
  name,
  onReset,
  onSelect,
  placeholder = "",
  prefixIcon,
  rowsBeforeScrolling = 5,
  value: liveValue,
}) => {
  // Hooks (refs)
  const inputRef = useRef<HTMLInputElement>(null);
  const typeaheadRef = useRef<HTMLDivElement>(null);

  // Hooks (state)
  const [locked, updateLocked] = useState(false);
  const [matches, updateMatches] = useState(0);
  const [value, updateValue] = useState("");
  const [visible, updateVisible] = useState(false);

  // Hooks (effects)
  useEffect(() => {
    if (disabled) {
      updateLocked(true);
    }
  }, []);

  useEffect(() => {
    updateValue(defaultValue);
  }, [defaultValue, liveValue]);

  // if this component is used within the context of a form, the liveValue can be reset from outside of the component. In this case we want to remove the lock
  useEffect(() => {
    if (!liveValue) {
      updateLocked(false);
    }
  }, [liveValue]);

  useEffect(() => {
    let matches = 0;
    if (value) {
      matches = items.filter((item) => findMatchingTextFilter(item, value)).length;
    }

    updateMatches(matches);
  }, [value]);

  // Hooks (other)
  // Hide results when clicked outside of the textfield
  useOnClickOutside(typeaheadRef, () => {
    updateVisible(false);
  });

  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = classnames.bind(styles);
  const classes = cx({
    compact,
    "has-prefix-icon": prefixIcon,
    typeahead: true,
    [`rows-before-scrolling-${rowsBeforeScrolling}`]: true,
  });

  // Re-activate the search field
  const releaseLock = () => {
    updateLocked(false);
    updateValue("");
    updateVisible(true);

    inputRef.current.focus();
    inputRef.current.value = "";

    // Tell the controller the reset the current value
    onReset();
  };

  // Set the new value based on a selection from the search results
  const setNewValue: TSetNewValue = (item, value) => {
    updateLocked(true);
    updateValue(item);
    updateVisible(false);

    inputRef.current.value = item;

    // Tell the controller the current value
    onSelect(value);
  };

  // As this filter is used twice in the component, we abstract it into a function
  const findMatchingTextFilter = (item, value) =>
    item?.text?.toLowerCase().includes(value.toLowerCase()) ||
    item?.suffixText?.toLowerCase().includes(value.toLowerCase());

  return (
    <div className={classes} {...buildDataAttributes("typeahead", dataAttributes)} ref={typeaheadRef}>
      <Textfield
        {...formValidationRegister}
        disabled={disabled || locked}
        hasError={hasError}
        help={help}
        label={label}
        name={name}
        onFocus={() => {
          if (!locked) {
            updateVisible(true);
          }
        }}
        onKeyUp={(value) => updateValue(value)}
        placeholder={placeholder}
        ref={inputRef}
        suffix={
          <>
            {locked ? (
              <Icon eventStopPropagation={false} id="closeCircle" onClick={() => releaseLock()} size={ESizes.XS} />
            ) : (
              <span className={styles.matches} onMouseDown={(e) => e.preventDefault()}>{`${matches} ${
                matches === 1 ? "match" : "matches"
              }`}</span>
            )}
          </>
        }
        value={value}
      />
      {visible && (
        <div className={styles.results}>
          <Card compact={true}>
            <Scroller>
              <ul className={styles.list}>
                {items
                  .filter((item) => !value || findMatchingTextFilter(item, value))
                  .map((person, index) => {
                    const { suffixText, text, value } = person;

                    return (
                      <li
                        className={styles["list-item"]}
                        key={`result-${index}`}
                        onClick={() => setNewValue(text, value)}
                      >
                        {prefixIcon && prefixIcon}
                        <div className={styles.item}>
                          <strong className={styles.text}>{text}</strong>
                          {!compact && <span className={styles["suffix-text"]}>{suffixText}</span>}
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </Scroller>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Typeahead;
