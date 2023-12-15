"use client";

// Components
import Icon from "components/atoms/icon";
import IconList from "components/molecules/icon-list";
import Recommendation from "components/molecules/recommendation";

// NPM imports
import classnames from "classnames/bind";
import React, { useState } from "react";
import AnimateHeight, { Height } from "react-animate-height";

// Scripts
import { buildDataAttributes } from "scripts/utilities";

// Styles
import styles from "./recommendations.module.scss";

// Types
import { IRecommendation } from "components/molecules/recommendation/types/recommendation.types";
import {
  IRecommendations,
  TRenderRecommendationsList,
  TToggleRecommendationsMoreHandler,
} from "./types/recommendations.types";
import { ESizes } from "types/enums";

export const Recommendations: React.FC<IRecommendations> = ({
  dataAttributes = {},
  heading,
  initiallyVisible,
  recommendations,
}) => {
  // Hooks (state)
  const [displayMode, updateDisplayMode] = useState<"expanded" | "contracted">("contracted");
  const [height, updateHeight] = useState<string | number>(0);

  // Should a toggle feature be applied?
  const recommendationsAvailable = recommendations.length;
  let firstSetVisible;
  let showToggle = false;

  if (initiallyVisible) {
    firstSetVisible = initiallyVisible;
    showToggle = true;

    // Check to see if there are any roles where there aren't enough recommendations to met the default visible figure
    // If there are, show as many recommendations as are available
    if (recommendationsAvailable <= initiallyVisible) {
      firstSetVisible = recommendationsAvailable;
      showToggle = false;
    }
  } else {
    firstSetVisible = recommendationsAvailable;
  }

  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = classnames.bind(styles);
  const classes = cx({
    compact: showToggle,
    recommendations: true,
    "no-toggle": !showToggle,
  });

  const toggleClasses = cx({
    toggle: true,
    expanded: displayMode === "expanded",
  });

  // Grab the initial recommendations to show
  const initialRecommendations: IRecommendation[] = recommendations.slice(0, firstSetVisible).map((item) => item);

  // If there are any further recommendations to show (beyond the restricted amount), show them in a toggle element
  let toggleRecommendations: IRecommendation[] = [];
  if (showToggle) {
    toggleRecommendations = recommendations.slice(firstSetVisible, recommendationsAvailable).map((item) => item);
  }

  /**
   * @function renderRecommendationsList - Generate the JSX for either the initial or other recommendations
   * @param {array} recommendations - The list of recommendations
   * @returns {array} - The list of recommendations in JSX format
   */
  const renderRecommendationsList: TRenderRecommendationsList = (recommendations) => {
    return recommendations.map((recommendation, index) => {
      const {
        hasNoPhoto,
        name,
        jobTitle: recommendeeJobTitle,
        recommendation: recommendeeRecommendation,
      } = recommendation;

      return (
        <Recommendation
          key={`recommendation-${index}`}
          hasNoPhoto={hasNoPhoto}
          jobTitle={recommendeeJobTitle}
          name={name}
          recommendation={recommendeeRecommendation}
        />
      );
    });
  };

  // Handle the toggle block
  const toggleRecommendationsMoreHandler: TToggleRecommendationsMoreHandler = (e, label) => {
    e.preventDefault();

    // Toggle the visibility of the additional content
    updateHeight(height === 0 ? "auto" : 0);
    updateDisplayMode(height === 0 ? "expanded" : "contracted");

    // Update the label text to synchronize with the visibility of the additional content
    const labelElem = e.target as HTMLElement;
    const { hideText, showText } = label;
    labelElem.innerText = displayMode === "expanded" ? showText : hideText;
  };

  return (
    <div className={classes} {...buildDataAttributes("recommendations", dataAttributes)}>
      {heading && heading}
      <div className={styles.outer}>
        {/* Show the initial recommendations */}
        <div className={styles.initial}>
          {recommendations.length > 0
            ? renderRecommendationsList(initialRecommendations)
            : "I didn't receive any recommendations for this role"}
        </div>
        {/* If there are any further recommendations to show (beyond the restricted amount), show them in a toggle element */}
        {showToggle && (
          <div className={styles.additional}>
            <AnimateHeight duration={500} height={height as Height}>
              <div className={styles["toggle-wrapper"]}>{renderRecommendationsList(toggleRecommendations)}</div>
            </AnimateHeight>
            <div className={toggleClasses}>
              <IconList
                direction="horizontal"
                iconSize={ESizes.XS}
                items={[
                  {
                    icon: <Icon id="chevron" />,
                    text: (
                      <span
                        className={styles["toggle-label"]}
                        onClick={(e) => {
                          toggleRecommendationsMoreHandler(e, {
                            hideText: `Show first ${firstSetVisible} recommendations only`,
                            showText: `Show all ${recommendationsAvailable} recommendations received`,
                          });
                        }}
                      >
                        {displayMode === "expanded"
                          ? `Show first ${firstSetVisible} ${firstSetVisible === 1 ? "recommendation" : "recommendations"} only`
                          : `Show all ${recommendationsAvailable} recommendations received`}
                      </span>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
