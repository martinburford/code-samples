// Icons
import Icons from "./icons";

// NPM imports
import classnames from "classnames/bind";
import React from "react";

// Scripts
import { buildDataAttributes } from "scripts/utilities";

// Styles
import styles from "./icon.module.scss";

// Types
import { IIcon } from "./types/icon.types";
import { EColours, ESizes } from "types/enums";

export const Icon: React.FC<IIcon> = ({
  colour = EColours.BASE_BLACK,
  className,
  dataAttributes = {},
  disabled,
  eventStopPropagation = true,
  expandedHitArea,
  id,
  onClick,
  size = ESizes.M,
}) => {
  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = classnames.bind(styles);
  let classesObj = {
    [colour as string]: true,
    disabled,
    icon: true,
    [`size-${size}`]: true,
  };

  // Are there any dynamic classes to add?
  if(expandedHitArea){
    classesObj[`expanded-hit-area-${expandedHitArea}`] = true;
  }

  if(onClick){
    classesObj["on-click"] = true;
  }

  // Build the modular styles object
  let classes = cx(classesObj);

  // Do custom utility classes need to be added?
  if(className) classes += ` ${className}`;

  // Create the SVG as a component
  const SVGComponent = Icons[id];

  // Attach a handler if one was provided
  const onClickHandler = onClick && !disabled ? (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => onClick(e) : null;

  return (
    <div
      {...buildDataAttributes("icon", dataAttributes)}
      className={classes}
      data-disabled={disabled}
      data-icon-id={id}
      onClickCapture={(e) => {
        // Should the event stop propagation?
        if (eventStopPropagation) {
          e.stopPropagation();
        }

        if (onClickHandler) onClickHandler(e);
      }}
    >
        <SVGComponent />
    </div>
  );
};

export default Icon;
