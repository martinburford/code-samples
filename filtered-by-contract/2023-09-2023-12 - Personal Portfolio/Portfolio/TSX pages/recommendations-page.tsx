// Components
import CompanyOverview from "components/organisms/company-overview";
import Divider from "components/atoms/divider";
import Heading from "components/atoms/heading";
import TagCloud from "components/atoms/tag-cloud";

// Scripts
import { getCompaniesData } from "scripts/data-fetching";

// Types
import type { Metadata } from "next";
import { TGetRecommendations } from "scripts/data-fetching.types";
import { ESizes } from "types/enums";

const Recommendations = async () => {
  // Fetch content for all recommendations
  const { companies, yearsWorking } = await getData();

  return (
    <>
      <Heading highlight={true} size={ESizes.M} variant={1} weight={600}>
        Recommendations
      </Heading>
      <p>
        This page includes recommendations that I've received from many of the roles I've worked in over the past{" "}
        {yearsWorking} years. A few key words summarising what past colleagues have thought about working alongside
        me are also shown below.
      </p>
      <TagCloud dataAttributes={{ "data-component-spacing": ESizes.XL }}/>
      {companies.map((company, index) => {
        const { recommendations, summary } = company;

        return (
          <>
            <CompanyOverview
              key={`company-overview-${index}`}
              recommendations={recommendations}
              recommendationsHeadingVisible={false}
              summary={summary}
              withinCard={true}
            />
            {/* A divider is not required to be placed after the last company / roles recommendations */}
            {index < companies.length-1 && <Divider variant="solid" />}
          </>
        );
      })}
    </>
  );
};

// Fetch content for the current gallery
const getData: TGetRecommendations = async () => {
  // Fetch the entire company dataset
  const companies = await getCompaniesData();

  // How many years have I been working for?
  const firstRoleYear = parseInt(companies[companies.length - 1].summary.dates.from.split(" ")[1]);
  const mostRecentRoleYear = parseInt(companies[0].summary.dates.to.split(" ")[1]);
  const yearsWorking = mostRecentRoleYear - firstRoleYear;

  // Remove the company data which isn't required for this page
  const data = companies
    .filter((company) => company.recommendations)
    .map((company) => {
      const { recommendations, summary } = company;

      return {
        recommendations: recommendations || [],
        summary,
      };
    });

  return {
    companies: data,
    yearsWorking,
  };
};

// Export the meta data, so that tags can be generated in the <head> of the document
export const metadata: Metadata = {
  authors: [{ name: "Martin Burford" }],
  description: "Welcome to the recommendations for Martin Burford, a Front-End Developer based in London, UK, with close to 25 years commercial experience in building complex web-based user interfaces",
  openGraph: {
    description: "Welcome to the recommendations for Martin Burford, a Front-End Developer based in London, UK, with close to 25 years commercial experience in building complex web-based user interfaces",
    images: [{
      height: 880,
      url: "/assets/open-graph/recommendations.png",
      width: 1280
    }],
    title: "Recommendations",
  },
  title: "Recommendations",
}

export default Recommendations;
