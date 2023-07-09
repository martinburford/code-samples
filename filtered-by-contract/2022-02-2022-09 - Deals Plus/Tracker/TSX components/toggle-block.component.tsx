// Components
import ContentJustified from "components/atoms/content-justified";
import Icon from "components/atoms/icon";

// NPM imports
import classnames from "classnames/bind";
import AnimateHeight, { Height } from "react-animate-height";
import { useState } from "react";

// Scripts
import { buildDataAttributes } from "scripts/utilities";

// Styles
import styles from "./toggle-block.module.scss";

// Types
import { IToggleBlock } from "./types/toggle-block.types";
import { ESizes } from "types/enums";

export const ToggleBlock: React.FC<IToggleBlock> = ({
  content,
  dataAttributes = {},
  expanded = false,
  header,
  theme = "default",
  toggleMode = "sideDown",
  toggleSpeed = "medium",
}) => {
  // Hooks
  const [height, updateHeight] = useState<string | number>(
    expanded ? "auto" : 0
  );
  const [displayMode, updateDisplayMode] = useState<"expanded" | "contracted">(
    expanded ? "expanded" : "contracted"
  );

  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = classnames.bind(styles);
  const classes = cx({
    [displayMode]: true,
    "theme-default": theme === "default",
    "theme-stroke": theme === "stroke",
    "theme-stroke-red": theme === "stroke-red",
    [`toggle-${toggleMode}`]: true,
    [`toggle-${toggleSpeed}`]: true,
    "toggle-block": true,
  });

  // What speed should the toggle animation be?
  let toggleSpeedInMs = 250; // "fast" by default

  if (toggleSpeed === "medium") toggleSpeedInMs = 500;
  if (toggleSpeed === "slow") toggleSpeedInMs = 1000;

  return (
    <div
      className={classes}
      {...buildDataAttributes("toggle-block", dataAttributes)}
    >
      <div
        className={styles.header}
        data-header
        onClick={() => {
          updateHeight(height === 0 ? "auto" : 0);
          updateDisplayMode(height === 0 ? "expanded" : "contracted");
        }}
      >
        <ContentJustified
          extendedSlot="slot1"
          slot1={header}
          slot2={
            <Icon
              id={toggleMode === "sideDown" ? "arrowRight" : "arrowDown"}
              eventStopPropagation={false}
              size={ESizes.XS}
            />
          }
          verticalAlignment="center"
        />
      </div>
      <AnimateHeight duration={toggleSpeedInMs} height={height as Height}>
        <div className={styles.content} data-content>{content}</div>
      </AnimateHeight>
    </div>
  );
};

export default ToggleBlock;
