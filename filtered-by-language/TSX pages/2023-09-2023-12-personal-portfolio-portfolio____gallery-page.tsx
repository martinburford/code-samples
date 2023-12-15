// Components
import CompanyOverview from "components/organisms/company-overview";

// NPM imports
import { Metadata } from "next";

// Scripts
import { getGalleryData, getCompaniesWithGalleryData } from "scripts/data-fetching";

// Types
import { TGetGalleryData } from "scripts/data-fetching.types";

type TProps = {
  params: { gallery: string }
}

const PortfolioGallery = async ({ params }: TProps) => {
  // Fetch content for the current gallery
  const galleryData = await getData(params.gallery);

  // De-structuring
  const {
    extended,
    github,
    recommendations,
    roleOverview,
    summary,
    technologiesUsed,
  } = galleryData;

  return (
    <>
      <CompanyOverview
        extended={extended}
        github={github}
        recommendations={recommendations}
        summary={summary}
        roleOverview={roleOverview}
        technologiesUsed={technologiesUsed}
        withinCard={false}
      />

      {/* <pre>{JSON.stringify(galleryData, null, 4)}</pre> */}
    </>
  );
};

// Fetch content for the current gallery
const getData: TGetGalleryData = async (slug: string) => {
  const galleryData = await getGalleryData(slug[0]);

  return galleryData;
};

export async function generateMetadata(
  { params }: TProps,
): Promise<Metadata> {
  // Fetch content for the current gallery
  const { gallery: gallerySlug } = params;
  const galleryData = await getData(gallerySlug);

  // eslint-disable-next-line
  const [yearFrom, monthFrom, yearTo, monthTo, ...clientName] = gallerySlug[0].split("-");

  // De-structuring
  const {
    roleOverview,
    summary: {
      companyName,
      dates: {
        from,
        to,
      },
      jobTitle,
      location,
    }
  } = galleryData;

  // For the company that the currently being viewed gallery belongs to, it's necessary to know how many times I've worked there AND which specific this role belong to
  // As I have had many repeat bookings
  // And the Open Graph image is different for each booking (despite being for the same client)
  const companies = await getCompaniesWithGalleryData();

  // Work out which role position the active gallery belongs to
  const companyRoles = companies.filter((company) => company.summary.companyName === companyName).reverse();
  const rolePosition = companyRoles.findIndex((company => company.summary.dates.from === from && company.summary.dates.to === to)) + 1;
 
  return {
    authors: [{ name: "Martin Burford" }],
    description: `I worked for ${companyName} between ${from} and ${to} in ${location}. ${roleOverview.join(" ")}`,
    title: `${companyName} - ${jobTitle}`,
    openGraph: {
      images: [{
        height: 701,
        url: `/assets/portfolio/listing-thumbnails/${clientName.join("-")}-${rolePosition}.png`,
        width: 960
      }],
    },
  }
}

export default PortfolioGallery;
