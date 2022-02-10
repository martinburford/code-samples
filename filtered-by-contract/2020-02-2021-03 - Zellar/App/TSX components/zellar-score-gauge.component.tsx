import React, { useEffect, useRef } from "react";

// Styles
import styles from "./zellar-score-gauge.module.scss";

// Types
import { IZellarScoreGauge } from "./zellar-score-gauge.types";

export const ZellarScoreGauge: React.FC<IZellarScoreGauge> = ({ score }) => {
  // References to the DOM elements requiring manipulation in response to dynamic prop values
  const scoreRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const degressMovement = score * 1.8;
  const startingDegrees = -90;
  const endingDegrees = startingDegrees + degressMovement;
  const changeInDegrees = endingDegrees - startingDegrees;
  const innerEndDegrees = 90 - changeInDegrees;

  useEffect(() => {
    scoreRef.current!.style.transform = `rotate(${endingDegrees}deg)`;
    innerRef.current!.style.transform = `rotate(${innerEndDegrees}deg)`;
    innerRef.current!.style.opacity = `1`;
  }, []);

  return (
    <>
      <div className={styles.pie}>
        <div className={styles["pie-outer"]}>
          <div className={styles["pie-inner"]}>
            <div>0 - 20%</div>
            <div>21% - 40%</div>
            <div>41% - 60%</div>
            <div>61% - 80%</div>
            <div>81% - 100%</div>
          </div>
        </div>
      </div>
      <div className={styles["zellar-score-gauge"]} data-selector="zellar-score-gauge">
        <div className={styles.score} ref={scoreRef}>
          <div className={styles.inner} ref={innerRef}>
            <strong>{score}</strong>
            <span>Zellar Score</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(ZellarScoreGauge);
