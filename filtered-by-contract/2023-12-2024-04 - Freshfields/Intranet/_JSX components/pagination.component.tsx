// Components
import Icon from "components/atoms/icon";

// NPM imports
import classnames from "classnames/bind";
import React from "react";

// Scripts
import { buildDataAttributes } from "scripts/utilities";

// Styles
import styles from "./pagination.module.scss";

// Types
import { ESizes } from "types/enums";
import { IPagination, TPageChangeHandler } from "./types/pagination.types";

export const Pagination: React.FC<IPagination> = ({
  className,
  currentPage,
  dataAttributes = {},
  loading = false,
  onPageChange,
  pagesVisible = 5,
  totalPages,
}) => {
  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = classnames.bind(styles);

  // If the total number of pages shown within the pagination is less than `pagesVisible`, adjust `pagesVisible`
  if (totalPages < pagesVisible) pagesVisible = totalPages;

  // Can the page be centrally positioned?
  const centralOverhang = Math.floor(pagesVisible / 2);
  const canCentreFromLeft = currentPage - centralOverhang > 0;
  const canCentreFromRight = currentPage + centralOverhang <= totalPages;
  const canCentre = canCentreFromLeft && canCentreFromRight;

  let startPosition = 1;

  // Work out the start position of the page numbers
  if (canCentre) {
    startPosition = currentPage - centralOverhang;
  } else {
    if (!canCentreFromRight) {
      startPosition =
        currentPage === totalPages
          ? currentPage - (pagesVisible - 1)
          : totalPages - pagesVisible + (totalPages - currentPage);
    }
  }

  // Determine whether the the previous and next navigation should be enabled or not
  const previousNavigationDisabled = currentPage === 1;
  const nextNavigationDisabled = currentPage === totalPages;

  let classes = cx({
    loading,
    "next-navigation-disabled": nextNavigationDisabled,
    pagination: true,
    "previous-navigation-disabled": previousNavigationDisabled,
  });

  // Do custom utility classes need to be added?
  if(className) classes += ` ${className}`;

  const paginateFirstClasses = cx({
    first: true,
    paginate: true,
  });

  const paginateLastClasses = cx({
    last: true,
    paginate: true,
  });

  // Handle the selection of a page number
  const pageChangeHandler: TPageChangeHandler = (e) => {
    const eventTargetElem = e.target as HTMLAnchorElement;

    // Bypass all events except for page links being clicked
    if (eventTargetElem.nodeName === "A") {
      // Pass the new page number to the parent component
      onPageChange(parseInt(eventTargetElem.innerText));
    }
  };

  return (
    <div
      className={classes}
      {...buildDataAttributes("pagination", dataAttributes)}
      onClickCapture={(e) => {
        if (!loading) pageChangeHandler(e);
      }}
    >
      <div className={styles.outer}>
        {/* First */}
        <div className={paginateFirstClasses}>
          <Icon
            disabled={loading || previousNavigationDisabled}
            expandedHitArea={ESizes.XS}
            id="first"
            onClick={() => onPageChange(1)}
            size={ESizes.XS}
          />
        </div>
        {/* Previous */}
        <div className={styles.paginate}>
          <Icon
            disabled={loading || previousNavigationDisabled}
            expandedHitArea={ESizes.XS}
            id="arrowLeft"
            onClick={() => onPageChange(currentPage - 1)}
            size={ESizes.XS}
          />
        </div>
        {loading ? (
          <span className={styles.loader}>Loading...</span>
        ) : (
          <ol className={styles.pages}>
            {Array.from(Array(pagesVisible), (_, index) => (
              <li
                className={styles.page}
                data-active={currentPage === index + startPosition}
                key={`pagination-page-${index}`}
                onClick={() => currentPage !== index + startPosition ? onPageChange(index + startPosition) : null}
              >
                {`${index + startPosition}`}
              </li>
            ))}
          </ol>
        )}
        {/* Next */}
        <div className={styles.paginate}>
          <Icon
            disabled={loading || nextNavigationDisabled}
            expandedHitArea={ESizes.XS}
            id="arrowRight"
            onClick={() => onPageChange(currentPage + 1)}
            size={ESizes.XS}
          />
        </div>
        {/* Last */}
        <div className={paginateLastClasses}>
          <Icon
            disabled={loading || nextNavigationDisabled}
            expandedHitArea={ESizes.XS}
            id="last"
            onClick={() => onPageChange(totalPages)}
            size={ESizes.XS}
          />
        </div>
      </div>
    </div>
  );
};

export default Pagination;
