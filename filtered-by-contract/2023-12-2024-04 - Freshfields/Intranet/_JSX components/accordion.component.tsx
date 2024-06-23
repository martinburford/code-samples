// Components
import Icon from "components/atoms/icon";

// NPM imports
import classnames from "classnames/bind";
import React, { useState } from "react";
import AnimateHeight, { Height } from "react-animate-height";

// Scripts
import { TRANSITION_MEDIUM } from "scripts/consts";
import { buildDataAttributes } from "scripts/utilities";

// Styles
import styles from "./accordion.module.scss";

// Types
import { IAccordion, TToggle } from "./types/accordion.types";
import { ESizes } from "types/enums";

export const Accordion: React.FC<IAccordion> = ({ className, dataAttributes = {}, items }) => {
  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = classnames.bind(styles);
  let classes = cx({
    accordion: true,
  });

  // Do custom utility classes need to be added?
  if (className) classes += ` ${className}`;

  // Hooks (state)
  const [toggleHeights, updateToggleHeight] = useState<Height[]>(() => {
    return items.map((item) => {
      if (item.expanded) return "auto";
      return 0;
    });
  });

  // Toggle a single accordion item open / closed
  const toggle: TToggle = (index) => {
    const currentHeights = [...toggleHeights];

    const updatedHeights = currentHeights.map((_, itemIndex) => {
      return itemIndex === index ? (currentHeights[index] === 0 ? "auto" : 0) : 0;
    });

    updateToggleHeight(updatedHeights);
  };

  return (
    <div className={classes} {...buildDataAttributes("accordion", dataAttributes)}>
      {items.map((item, index) => {
        const { content, heading, theme = "code" } = item;

        return (
          <div
            className={styles.item}
            data-index={index}
            data-expanded={toggleHeights[index] === "auto"}
            data-theme={theme}
            key={`accordion-${index}`}
          >
            <div className={styles.heading} onClick={() => toggle(index)}>
              <Icon eventStopPropagation={false} id="arrowRight" size={ESizes.XXS} />
              {heading}
            </div>
            <AnimateHeight duration={TRANSITION_MEDIUM} height={toggleHeights[index] as Height}>
              <div className={styles.content}>{content}</div>
            </AnimateHeight>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
