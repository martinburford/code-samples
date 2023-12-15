"use client";

// Components
import Accordion from "components/organisms/accordion";
import ChevronList from "components/molecules/chevron-list";
import Icon from "components/atoms/icon";
import IconList from "components/molecules/icon-list";
import ToggleBlock from "components/organisms/toggle-block";

// Context
import NavigationContext from "context/providers/navigation";

// Data
import Data from "data/companies/index.json";

// NPM imports
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";

// Scripts
import { useOnClickOutside } from "scripts/hooks/useOnClickOutside";
import { buildDataAttributes, generateGallerySlug, hasParent } from "scripts/utilities";

// Styles
import styles from "./navigation.module.scss";

// Types
import { ESizes } from "types/enums";
import { IGalleryState, IGroupsState, INavigation, TIsElementClicked, TOnSelectGroup, TOnToggleYear } from "./types/navigation.types";

export const Navigation: React.FC<INavigation> = ({ dataAttributes = {} }) => {
  // Hooks (context)
  const context = useContext(NavigationContext);

  // Use useMemo to memoize the result and prevent re-rendering when contextValue changes
  const memoToggleNavigation = useMemo(() => {
    // Your logic using contextValue here
    return context.toggleNavigation;
  }, [context.toggleNavigation]); // Only recompute when contextValue.someValue changes

  // Hooks (effects)
  const pathname = usePathname();
  const activeYear = Number(pathname.split("-")[2]);
  useEffect(() => {
    // Find the gallery data, in order to populate the navigation
    const galleries = Data.companies.filter((item) => item.galleries);

    // For each gallery, categorize it against the year the role was completed
    const galleryYears = {};
    galleries.map((gallery) => {
      // Grab the company name and the year the role ended
      const {
        linkedProject,
        summary: { companyName, dates },
      } = gallery;
      const galleryYear = dates.to.split(" ")[1];

      // Create the entry for any years not previously created
      if (!galleryYears[galleryYear]) {
        galleryYears[galleryYear] = {
          expanded: false,
          roles: [],
        };
      }

      // Add a role to a previously created year
      galleryYears[galleryYear].roles.push({
        companyName,
        slug: `${generateGallerySlug(companyName, dates)}/${linkedProject}`,
      });
    });

    // Store the galleries in local component state
    updateGalleryState(galleryYears);

    // For an initial page load, auto-select the year that the visible gallery belongs to
    // The construct of ALL gallery slugs is:
    // YYYY-MM-YYYY-MM-COMPANY/PROJECT
    // FromDate-ToDate-COMPANY/PROJECT
    // Hence why .split("-")[2] is the year I stopped working with the company
    onToggleYear(true, galleryYears, activeYear);
  }, []);

  useEffect(() => {
    // Auto-highlight any top-level groups based on the current URL
    const pageBase = pathname.split("/")[1];
    switch (pageBase) {
      case "cv":
      case "portfolio":
      case "recommendations":
        onSelectGroup(pageBase);
        break;
      default:
        onSelectGroup("home");
        break;
      }

      // When switching from the portfolio listing page, the year a specific gallery belongs to should be auto-expanded
      // Guard against the state not existing, so as to not conflict with the initial toggle
      if(galleryState[activeYear]){
        onToggleYear(true, galleryState, activeYear);
      }
  }, [pathname]);

  // Hooks (NextJS)
  const router = useRouter();

  // Hooks (refs)
  const navigationRef = useRef<HTMLDivElement>(null);

  // Check to see if a click event was triggered from a specific DOM node (or any of its children)
  const isElementClicked: TIsElementClicked = (target, dataId) => {
    const parentElem = document.querySelector(`[data-component-id="${dataId}"]`);
    return (
      (target as Element).hasAttribute(`[data-component-id="${dataId}"]`) ||
      target === parentElem ||
      hasParent(target, parentElem)
    );
  };

  // Update the expanded state of expanded years, so that ONLY 1x single year group remains open at any one time
  const onToggleYear: TOnToggleYear = (expanded, galleryData, year) => {
    const updatedData = {};

    for (const [previousYear, previousYearData] of Object.entries(galleryData)) {
      updatedData[previousYear] = {
        ...previousYearData as IGalleryState,
        expanded: Number(previousYear) === year ? expanded : false,
      };
    }

    updateGalleryState(updatedData);
  };

  // Toggle the active state of top-level groups
  const onSelectGroup: TOnSelectGroup = (groupId) => {
    // Hide the navigation when selecting any option other than "Portfolio"
    if(groupId !== "portfolio") {
      memoToggleNavigation(false);
    }
    
    updateGroupsState({
      cv: false,
      home: false,
      portfolio: false,
      recommendations: false,
      [groupId]: true,
    });
  };

  // Hooks (state)
  const [galleryState, updateGalleryState] = useState<IGalleryState>({});

  const [groupsState, updateGroupsState] = useState<IGroupsState>({
    cv: false,
    home: false,
    portfolio: false,
    recommendations: false,
  });

  // Hide sidebar when clicked outside of it
  useOnClickOutside(navigationRef, (event) => {
    const { target } = event;

    // Should any DOM elements be ignored with regards to toggling the navigation closed when clicking OUTSIDE of the <Navigation> component?
    if (!isElementClicked(target, "hamburger")) {
      memoToggleNavigation(false);
    }
  });

  return (
    <div className={styles.navigation} {...buildDataAttributes("navigation", dataAttributes)} ref={navigationRef}>
      <IconList
        items={[
          {
            icon: <Icon id="home" />,
            onClick: () => {
              onSelectGroup("home");
              router.push("/");
            },
            text: <strong>Home</strong>,
          },
        ]}
        iconSize={ESizes.S}
        selectedNavigationGroup={groupsState.home}
      />
      <IconList
        items={[
          {
            icon: <Icon id="cv" />,
            onClick: () => {
              onSelectGroup("cv");
              router.push("/cv");
            },
            text: <strong>Curriculum Vitae</strong>,
          },
        ]}
        iconSize={ESizes.S}
        selectedNavigationGroup={groupsState.cv}
      />

      <ToggleBlock
        content={
          <Accordion
            items={Object.keys(galleryState)
              .reverse()
              .map((year) => {
                return {
                  content: (
                    <ChevronList
                      items={galleryState[year].roles.map(({ companyName, slug }) => (
                        <Link href={`/portfolio/${slug}`} onClick={() => memoToggleNavigation(false)}>{companyName}</Link>
                      ))}
                    />
                  ),
                  expanded: galleryState[year].expanded,
                  header: <strong>{year}</strong>,
                  onToggle: (expanded) => onToggleYear(expanded, galleryState, Number(year)),
                };
              })}
          />
        }
        expanded={groupsState.portfolio}
        header={
          <div className="align-center flex">
            <Icon dataAttributes={{ "data-margin-right": ESizes.XS }} id="portfolio" size={ESizes.S} />
            <strong>Portfolio</strong>
          </div>
        }
        iconPosition="end"
        onToggle={(expanded) => {
          if (expanded) {
            onSelectGroup("portfolio");
          }
        }}
      />

      <IconList
        items={[
          {
            icon: <Icon id="linkedIn" />,
            onClick: () => {
              onSelectGroup("recommendations");
              router.push("/recommendations");
            },
            text: <strong>Recommendations</strong>,
          },
        ]}
        iconSize={ESizes.S}
        selectedNavigationGroup={groupsState.recommendations}
      />
      <IconList
        items={[
          {
            icon: <Icon id="github" />,
            onClick: () => router.push("http://www.github.com/martinburford/code-samples"),
            text: <strong>Code samples</strong>,
          },
        ]}
        iconSize={ESizes.S}
      />
    </div>
  );
};

// Memo this component, as it should not re-render when context changes (as props won't change)
// This is important, as the nested expanded items should persist even when context updates`
export default React.memo(Navigation);
