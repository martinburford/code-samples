// NPM imports
import classnames from "classnames/bind";

// Scripts
import { buildDataAttributes } from "@aigence/scripts/utilities";

// Styles
import styles from "./bar-graph.module.scss";

// Types
import { IBarGraph } from "./types/bar-graph.types";

export const BarGraph: React.FC<IBarGraph> = ({ data, dataAttributes = {}, heading, xAxisLabel }) => {
  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = classnames.bind(styles);

  // How wide should each bar be?
  const barWidth = 100 / data.length;

  const barStyles = {
    width: `${barWidth}%`,
  };

  // Locate the highest numeric value from the dataset
  // This will become 100% for the Y-axis
  const maximumDataValue = Math.max(...data.map((obj) => obj.value));

  return (
    <div className={styles["bar-graph"]} {...buildDataAttributes("bar-graph", dataAttributes)}>
      {heading && <strong className={styles.heading}>{heading}</strong>}
      <div className={styles.chart}>
        <div className={styles.bars}>
          {data.map((bar, index) => {
            const { colour, value } = bar;

            // What classes should each individual bar have?
            const barClasses = cx({
              bar: true,
              [colour]: true,
            });

            barStyles["height"] = `${(value / maximumDataValue) * 100}%`;

            return <div className={barClasses} key={`bar-${index}`} style={{ ...barStyles }} />;
          })}
        </div>
        <div className={styles.labels}>
          {data.map((bar, index) => {
            const { label, value } = bar;

            return (
              <div className={styles.label} key={`label-${index}`}>
                <span className={styles.value}>{value}</span>
                <span className={styles.label} key={`label-${index}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {xAxisLabel && <strong className={styles.xAxisLabel}>{xAxisLabel}</strong>}
    </div>
  );
};

export default BarGraph;
