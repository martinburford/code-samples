// Components
import Divider from "components/atoms/divider";
import FinancialSummary from "components/organisms/financial-summary";
import FinancialSummaryChart from "components/molecules/financial-summary-chart";
import Heading from "components/atoms/heading";
import Row from "components/atoms/row";

// NPM imports
import classnames from "classnames/bind";
import React from "react";
import Skeleton from "react-loading-skeleton";

// Scripts
import { buildDataAttributes } from "scripts/utilities";

// Styles
import styles from "./financial-summary-grid.module.scss";

// Types
import { IFinancialSummaryGrid } from "./types/financial-summary-grid.types";
import WithStyles from "components/webparts/hoc/styles";

export const FinancialSummaryGrid: React.FC<IFinancialSummaryGrid> = ({
  background = "none",
  className,
  dataAttributes = {},
  debt: { chart: debtChart, summaries: debtSummaries },
  heading,
  loading = false,
  stretchToFit = false,
  wip: { chart: wipChart, summaries: wipSummaries },
}) => {
  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = classnames.bind(styles);
  let classes = cx({
    "financial-summary-grid": true,
    loading,
  });

  // Do custom utility classes need to be added?
  if (className) classes += ` ${className}`;

  // JSX block for all loading financial summaries
  const loadingFinancialSummary = (
    <div>
      <Skeleton />
      <Skeleton height={40} />
      <Divider className="mt-20" variant="solid" />
      <div className="flex" style={{ justifyContent: "space-around" }}>
        <Skeleton width={50} />
        <Skeleton width={50} />
      </div>
      <Divider className="mb-10 mt-10" variant="solid" />
      <Skeleton height={40} />
    </div>
  );

  // JSX block for all loading financial summary charts
  const loadingFinancialSummaryChart = (
    <div>
      <Skeleton />
      <Skeleton height={154} />
    </div>
  );

  return (
    <WithStyles>
      <div className={classes} {...buildDataAttributes("financial-summary-grid", dataAttributes)}>
        <Row background={background} stretchToFit={stretchToFit}>
          <Heading variant={4} weight={500}>
            {heading}
          </Heading>
          <div className={styles.rows}>
            <div className={styles.row} data-type="wip">
              <div className={styles.graph}>
                {loading ? loadingFinancialSummaryChart : <FinancialSummaryChart {...debtChart} />}
              </div>
              <div className={styles.scroller}>
                {loading ? (
                  <>
                    {loadingFinancialSummary}
                    {loadingFinancialSummary}
                    {loadingFinancialSummary}
                    {loadingFinancialSummary}
                  </>
                ) : (
                  debtSummaries.map((summary, index) => <FinancialSummary key={`summary=${index}`} {...summary} />)
                )}
              </div>
            </div>
            <div className={styles.row} data-type="debt">
              <div className={styles.graph}>
                {loading ? loadingFinancialSummaryChart : <FinancialSummaryChart {...wipChart} />}
              </div>
              <div className={styles.scroller}>
                {loading ? (
                  <>
                    {loadingFinancialSummary}
                    {loadingFinancialSummary}
                    {loadingFinancialSummary}
                    {loadingFinancialSummary}
                  </>
                ) : (
                  wipSummaries.map((summary, index) => <FinancialSummary key={`summary=${index}`} {...summary} />)
                )}
              </div>
            </div>
          </div>
        </Row>
      </div>
    </WithStyles>
  );
};

export default FinancialSummaryGrid;
