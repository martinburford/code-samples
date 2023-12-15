// Components
import Button from "components/atoms/button";
import Card from "components/atoms/card";
import ChevronList from "components/molecules/chevron-list";
import ChipList from "components/organisms/chip-list";
import CodeSamples from "components/molecules/code-samples";
import Divider from "components/atoms/divider";
import Icon from "components/atoms/icon";
import Heading from "components/atoms/heading";
import Recommendations from "components/organisms/recommendations";
import RoleSummary from "components/organisms/role-summary";

// NPM imports
import classnames from "classnames/bind";

// Scripts
import { TECHNOLOGY_ICON_IDS } from "scripts/consts";
import { buildDataAttributes } from "scripts/utilities";

// Styles
import styles from "./company-overview.module.scss";

// Types
import { EColours, ESizes } from "types/enums";
import { ICompanyOverview } from "./types/company-overview.types";

export const CompanyOverview: React.FC<ICompanyOverview> = ({
  dataAttributes = {},
  extended,
  github,
  initiallyVisibleRecommendations,
  recommendations,
  recommendationsHeadingVisible = true,
  roleOverview,
  summary,
  technologiesUsed,
  withinCard = false,
}) => {
  const {
    companyName,
    dates: { from, to },
    jobTitle,
    location,
    logo,
  } = summary;

  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = classnames.bind(styles);
  const classes = cx({
    "company-overview": true,
  });

  // Construct the components inner content
  // This is necessary as it may be required to wrap this content with a parent <Card> component
  const innerContent = (
    <>
      {/* Role Summary */}
      <RoleSummary
        companyName={companyName}
        dates={`${from} - ${to}`}
        jobTitle={jobTitle}
        location={location}
        logo={logo}
        withinCard={withinCard}
      />

      {extended && (
        <>
          <Button
            prefixIcon={<Icon colour={EColours.SUCCESS} id="circleTick" />}
            variant={EColours.SUCCESS}
          >
            Contract extended multiple times
          </Button>
          <Divider variant="gradient" />
        </>
      )}

      {/* Role overview */}
      {roleOverview && (
        <>
          <ChevronList
            heading={
              <Heading
                dataAttributes={{ "data-component-spacing": ESizes.XS }}
                size={ESizes.XXS}
                variant={5}
                weight={600}
              >
                Role overview
              </Heading>
            }
            items={[...roleOverview]}
          />
          <Divider variant="gradient" />
        </>
      )}

      {/* Technologies used */}
      {technologiesUsed && (
        <>
          <ChipList
            items={technologiesUsed.map((technologyUsed) => {
              return {
                iconId: TECHNOLOGY_ICON_IDS[technologyUsed],
                label: technologyUsed,
              };
            })}
            heading={
              <Heading
                dataAttributes={{ "data-component-spacing": ESizes.XS }}
                size={ESizes.XXS}
                variant={5}
                weight={600}
              >
                Technologies used
              </Heading>
            }
          />
          <Divider variant="gradient" />
        </>
      )}

      {/* Code samples */}
      {github && (
        <>
          <CodeSamples
            heading={
              <Heading
                dataAttributes={{ "data-component-spacing": ESizes.XS }}
                size={ESizes.XXS}
                variant={5}
                weight={600}
              >
                Code samples
              </Heading>
            }
            githubUrl={github.role}
          />
          <Divider variant="gradient" />
        </>
      )}

      {/* Recommendations */}
      <Recommendations
        heading={
          recommendationsHeadingVisible ? (
            <Heading
              dataAttributes={{ "data-component-spacing": ESizes.XS }}
              size={ESizes.XXS}
              variant={5}
              weight={600}
            >
              Recommendations
            </Heading>
          ) : null
        }
        initiallyVisible={initiallyVisibleRecommendations}
        recommendations={recommendations || []}
      />
    </>
  );

  // Should a card be added to the DOM structure of this components render?
  let wrapperElem = innerContent;
  if (withinCard) {
    wrapperElem = (
      <Card>
        {innerContent}
      </Card>
    );
  }

  return <div className={classes} {...buildDataAttributes("company-overview", dataAttributes)}>
    {wrapperElem}
  </div>;
};

export default CompanyOverview;
