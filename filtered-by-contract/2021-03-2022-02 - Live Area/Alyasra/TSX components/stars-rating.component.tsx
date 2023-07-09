// @ts-nocheck
/* eslint-disable react/display-name */
import classnames from 'classnames/bind';
import Link from 'next/link';
import React, { forwardRef, useEffect, useState } from 'react';

// Components
import Icon from 'components/ui/atoms/icon';

// Scripts
import { buildDataAttributes } from 'scripts/utilities';

// Styles
import styles from './stars-rating.module.scss';

// Types
import { IStarsRating } from './types/stars-rating.types';

export const StarsRating: React.FC<IStarsRating> = ({
  colour = 'tan',
  dataAttributes = {},
  productId,
  mode,
  score,
  size,
  votes,
  url,
}) => {
  // Hooks
  const [state, updateState] = useState({
    currentHover: -1,
    initialScore: -1,
  });

  useEffect(() => {
    // Assign the initial score into component state
    updateState({
      ...state,
      initialScore: score,
    });
  }, []);

  // Bind classnames to the components CSS module object in order to access its modular styles
  const isInteractive = mode === 'interactive';
  const isStatic = mode === 'static';

  const cx = classnames.bind(styles);
  const classes = cx({
    [size]: true,
    static: isStatic,
    'stars-rating': true,
    interactive: isInteractive,
  });

  // De-struturing
  const { currentHover } = state;

  const starElems = [];
  let customIconDataAttributes;
  let starElem;
  let starType;

  // Determine how many stars need to be filled in and how many remain empty
  [...Array(5)].map((_, index) => {
    // Reset any custom attributes
    customIconDataAttributes = {};

    const iterator = index + 1;
    const isDecimal = score.toString().indexOf('.') > -1;
    const baseScore = isDecimal ? parseInt(score.toString().split('.')[0]) : score;
    const starOnClick = isInteractive ? event => onSelectStar(event) : null;

    // What type of star should be shown?
    if (iterator <= baseScore) {
      starType = 'starFull';
    } else if (iterator > baseScore) {
      starType = 'starEmpty';
    }

    if (isDecimal) {
      if (iterator - baseScore === 1) {
        starType = 'starHalfRight';

        // Apply rotation of 180deg for rtl half stars
        customIconDataAttributes['data-rotate-180'] = true;
      }
    }

    // Should the star be shown as filled or empty (due to hovering)
    if (currentHover !== -1) {
      if (iterator <= currentHover) {
        starType = 'starFull';
      } else {
        starType = 'starEmpty';
      }
    }

    starElem = (
      <span
        key={`icon-${iterator}`}
        onMouseEnter={isInteractive ? event => onHoverStar(event) : null}
        onMouseLeave={isInteractive ? () => onHoverLeave() : null}
      >
        <Icon
          alpha={100}
          colour={colour}
          dataAttributes={{ ...customIconDataAttributes }}
          id={starType}
          onClick={starOnClick}
        />
      </span>
    );

    // Concatenate the stars together
    starElems.push(starElem);
  });

  // Forward client-side routing onto all navigation items
  const NavigationItem = forwardRef(({ children, href, onClick }, ref) => {
    return (
      <a className={styles.stars} href={href} onClick={onClick} ref={ref}>
        {children}
      </a>
    );
  });

  // Locate the position of the star (ie: the star rating) that the user either selected or is hovering over
  const locateActiveStar = event => {
    const selectedStarElem = event.target.closest('span');
    const selectedStarIndex = Array.prototype.indexOf.call(selectedStarElem.parentNode.children, selectedStarElem);

    console.log(`[Component]: productId=${productId}, selected star=${selectedStarIndex + 1}`);

    return selectedStarIndex + 1;
  };

  // Reset the flag identifying that no stars are currently hovered
  const onHoverLeave = () => {
    updateState({
      ...state,
      currentHover: -1,
    });
  };

  // Handle the hovering of a star, to provide real-time hover effects to the user
  const onHoverStar = event => {
    const activeStar = locateActiveStar(event);

    updateState({
      ...state,
      currentHover: activeStar,
    });
  };

  // A star has been clicked by the user wishing to leave a review
  const onSelectStar = event => {
    const activeStar = locateActiveStar(event);

    // Having located the star review value, handle the submission of that review
    alert(`<StarsRating>: clicked star: productId=${productId}, star rating=${activeStar}`);
  };

  // Construct the correct type of stars (and associated interactions)
  // Unless otherwise specified, a static star list is created by default
  let starsElem = <div className={styles.stars}>{starElems}</div>;

  switch (mode) {
    case 'clickthrough':
      starsElem = (
        <Link href={url} passHref>
          <NavigationItem>
            <>
              {starElems}
              <span className={styles.votes}>({votes})</span>
            </>
          </NavigationItem>
        </Link>
      );

      break;
    case 'interactive':
      starsElem = (
        <div className={styles.stars}>
          {starElems}
          <span className={styles.votes}>({votes})</span>
        </div>
      );

      break;
  }

  return (
    <div className={classes} {...buildDataAttributes('stars-rating', dataAttributes)}>
      {starsElem}
    </div>
  );
};

export default React.memo(StarsRating);
