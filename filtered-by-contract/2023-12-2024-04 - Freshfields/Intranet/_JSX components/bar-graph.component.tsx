// NPM imports
import classnames from "classnames/bind";
import { colord } from "colord";
import React from "react";

// Scripts
import { COLOUR_HEXES } from "scripts/consts";
import { buildDataAttributes, formatNumberAsCurrency } from "scripts/utilities";

// Styles
import styles from "./bar-graph.module.scss";

// Types
import { IBarGraph } from "./types/bar-graph.types";
import { IDynamicObject } from "types/interfaces";

export const BarGraph: React.FC<IBarGraph> = ({
  barBaseColour,
  className,
  data,
  dataAttributes = {},
  heading,
  valueRenderer,
}) => {
  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = classnames.bind(styles);
  let classes = cx({
    "bar-graph": true,
  });

  // Do custom utility classes need to be added?
  if (className) classes += ` ${className}`;

  // How wide should each bar be?
  const barWidth = 100 / data.length;

  const barStyles: IDynamicObject = {
    width: `${barWidth}%`,
  };

  // Locate the highest numeric value from the dataset
  // This will become 100% for the Y-axis
  const maximumDataValue = Math.max(...data.map((obj) => obj.value));

  type TRenderValue = (value: number, valueRenderer: "currency") => number | string;

  const renderValue: TRenderValue = (value, valueRenderer) => {
    switch (valueRenderer) {
      case "currency":
        return formatNumberAsCurrency(value);
      default:
        return value;
    }
  };

  return (
    <div className={classes} {...buildDataAttributes("bar-graph", dataAttributes)}>
      {heading && heading}
      <div className={styles.chart}>
        <div className={styles.bars}>
          {data.map((bar, index) => {
            const { value } = bar;

            // What classes should each individual bar have?
            const barClasses = cx({
              bar: true,
            });

            // Maximum colour tolerance (the difference between the lightest and darkest available shades) = 0.3, so 100% would be 0.003x100=0.3
            // Determine the shade of the bar, based on the current bars value as a percentage of the maximum bar value
            const barValueAsPercentage = (value / maximumDataValue) * 100;
            const barValueLightenRatio = 0.003;
            const barLightenMultiplier = (100 - barValueAsPercentage) * barValueLightenRatio;
            const barColour = colord(COLOUR_HEXES[barBaseColour]).lighten(barLightenMultiplier).toHex();

            barStyles["background"] = barColour;
            barStyles["height"] = `${(value / maximumDataValue) * 100}%`;

            return <div className={barClasses} key={`bar-${index}`} style={{ ...barStyles }} />;
          })}
        </div>
        <div className={styles.labels}>
          {data.map((bar, index) => {
            const { label, value } = bar;

            return (
              <div className={styles["bar-label"]} key={`label-${index}`}>
                <span className={styles.value}>{renderValue(value, valueRenderer)}</span>
                <span className={styles.label} key={`label-${index}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BarGraph;
