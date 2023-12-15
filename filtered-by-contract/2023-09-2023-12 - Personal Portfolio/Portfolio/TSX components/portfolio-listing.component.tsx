"use client";

// Components
import Button from "components/atoms/button";
import ChevronList from "components/molecules/chevron-list";
import Divider from "components/atoms/divider";
import Icon from "components/atoms/icon";
import Image from "components/atoms/image";
import RoleSummary from "components/organisms/role-summary";

// NextJS
import Link from "next/link";

// NPM imports
import React, { useState } from "react";

// Scripts
import { buildDataAttributes } from "scripts/utilities";

// Styles
import styles from "./portfolio-listing.module.scss";

// Types
import { EColours } from "types/enums";
import { IPortfolioListing } from "./types/portfolio-listing.types";

export const PortfolioListing: React.FC<IPortfolioListing> = ({
  dataAttributes = {},
  extended,
  linkedProject,
  responsive,
  roleOverview,
  rolePosition,
  roleType,
  slug,
  summary,
}) => {
  // Hooks
  const [toggleOverviewState, updatetoggleOverviewState] = useState(false);

  const {
    companyName,
    dates: { from, to },
    jobTitle,
    location,
    logo,
  } = summary;

  // Images for responsive vs non-responsive sites must use a different aspect ratio
  const imageDimensions = responsive
    ? {
        height: 467,
        width: 640,
      }
    : {
        height: 405,
        width: 640,
      };

  const { height, width } = imageDimensions;

  // How many characters should a role overview truncate after?
  const toggleTruncateLimit = 600;

  return (
    <div className={styles["portfolio-listing"]} {...buildDataAttributes("portfolio-listing", dataAttributes)}>
      <div className={styles["role-type"]} data-type={roleType === "Permanent" ? "perm" : "contract"}>{roleType === "Permanent" ? "Perm" : roleType}</div>
      <div className={styles.image}>
        <Image
          alt={companyName}
          height={height}
          src={`/assets/portfolio/listing-thumbnails/${companyName
            .split(" ")
            .join("-")
            .toLowerCase()}-${rolePosition}.png`}
          width={width}
        />
      </div>
      <div className={styles.content}>
        {/* Role Summary */}
        <RoleSummary
          companyName={companyName}
          dates={`${from} - ${to}`}
          jobTitle={jobTitle}
          location={location}
          logo={logo}
        />
        <Divider variant="dotted" />
        <div className={styles.overview}>
          {extended && (
            <>
              <Button
                compact={true}
                prefixIcon={<Icon colour={EColours.SUCCESS} id="circleTick" />}
                variant={EColours.SUCCESS}
              >
                Contract extended multiple times
              </Button>
              <br />
            </>
          )}
          {roleOverview.length > toggleTruncateLimit ? (
            <>
              <span className={styles["initial-text"]}>
                {roleOverview.substr(0, toggleTruncateLimit)}
                {!toggleOverviewState && "..."}
              </span>
              {toggleOverviewState ? (
                <>
                  <span className={styles["toggle-text"]}>
                    {roleOverview.substr(toggleTruncateLimit, roleOverview.length - toggleTruncateLimit)}
                  </span>
                  <a className={styles["toggle-link"]} onClick={() => updatetoggleOverviewState(false)}>
                    (less ...)
                  </a>
                </>
              ) : (
                <a className={styles["toggle-link"]} onClick={() => updatetoggleOverviewState(true)}>
                  (more ...)
                </a>
              )}
            </>
          ) : (
            <span>{roleOverview}</span>
          )}
        </div>
        <br />
        <ChevronList items={[<Link href={`/portfolio/${slug}/${linkedProject}`}>View project details</Link>]} />
      </div>
    </div>
  );
};

export default PortfolioListing;
