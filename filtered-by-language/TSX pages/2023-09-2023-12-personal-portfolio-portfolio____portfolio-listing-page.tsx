// Components
import Heading from "components/atoms/heading";
import PortfolioListing from "components/organisms/portfolio-listing";

// Scripts
import { getCompaniesWithGalleryData } from "scripts/data-fetching";
import { generateGallerySlug } from "scripts/utilities";

// Types
import type { Metadata } from "next";
import { ESizes } from "types/enums";

const Portfolio = async () => {
  // Fetch content for the current gallery
  const companies = await getData();

  return (
    <>
      <Heading highlight={true} size={ESizes.M} variant={1} weight={600}>
        Portfolio
      </Heading>
      <p>
        This page shows all jobs that I've worked on since 2004. I worked for a number of years prior to that, but I've
        not felt the need to categorize this work, as it was more application development rather than dedicated
        Front-End Development, which I focus on solely these days.
      </p>
      {companies.map((company, index) => {
        const { extended, linkedProject, responsive, roleOverview, rolePosition, roleType, slug, summary } = company;

        return (
          <PortfolioListing
            extended={extended}
            key={`portfolio-listing-${index}`}
            linkedProject={linkedProject}
            responsive={responsive}
            roleOverview={roleOverview}
            rolePosition={rolePosition}
            roleType={roleType}
            slug={slug}
            summary={summary}
          />
        );
      })}
    </>
  );
};

// Fetch content for all galleries
const getData = async () => {
  const companies = await getCompaniesWithGalleryData();

  return companies.map((company) => {
    const { extended, galleries, linkedProject, responsive, roleOverview, roleType, summary } = company;

    // For each company, it's necessary to know how many times I've worked there
    // As I have had many repeat bookings
    // Knowing this will help with image names within this page
    const companyRoles = companies.filter((company) => company.summary.companyName === summary.companyName).reverse();
    const rolePosition = companyRoles.indexOf(company) + 1;

    // Dynamically generate the gallery slug
    const { companyName, dates } = summary;

    const data = {
      extended,
      galleries,
      linkedProject,
      responsive,
      roleOverview: roleOverview.join(" "),
      rolePosition,
      roleType,
      slug: generateGallerySlug(companyName, dates),
      summary,
    };

    return data;
  });
};

// Export the meta data, so that tags can be generated in the <head> of the document
export const metadata: Metadata = {
  authors: [{ name: "Martin Burford" }],
  description:
    "Welcome to the portfolio of Martin Burford, a Front-End Developer based in London, UK, with close to 25 years commercial experience in building complex web-based user interfaces",
  openGraph: {
    description:
      "Welcome to the portfolio of Martin Burford, a Front-End Developer based in London, UK, with close to 25 years commercial experience in building complex web-based user interfaces",
    images: [
      {
        height: 880,
        url: "/assets/open-graph/portfolio.png",
        width: 1280,
      },
    ],
    title: "Portfolio",
  },
  title: "Portfolio",
};

export default Portfolio;
