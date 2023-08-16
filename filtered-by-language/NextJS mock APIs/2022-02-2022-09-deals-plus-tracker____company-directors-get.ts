// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

// Data
import { generateDocumentList, getRandomBoolean, getRandomCountry, generateRandomDateThisMonth, getRandomDirectorStatus } from "pages/api/data-lists";

// Scripts
import { API_PAGE_RECORDS_CORPORATE_STRUCTURE_COMPANY_DIRECTORS } from "scripts/consts";

// Types
import { ICompanyDirector } from "types/pages/corporate-structure/company-director.types";

type TGenerateCompanyDirectors = (total: number) => ICompanyDirector[];

const generateCompanyDirectors: TGenerateCompanyDirectors = (total) => {
  return [...Array(total)].map((_, index) => {
    const prefixedIndex = (index+1).toString().padStart(2, "0");

    return {
      appointedOn: generateRandomDateThisMonth(),
      correspondenceAddress: `Correspondence address ${prefixedIndex}`,
      countryOfResidence: getRandomCountry(),
      dateOfBirth: generateRandomDateThisMonth(),
      dateResigned: generateRandomDateThisMonth(),
      documents: generateDocumentList(),
      id: index+1,
      name: `Director ${prefixedIndex}`,
      nationality: "British",
      residentialAddress: `Residential address ${prefixedIndex}`,
      role: `Role ${prefixedIndex}`,
      signingRights: getRandomBoolean(),
      status: getRandomDirectorStatus(),
    }
  })
}

export default function handler(req: NextApiRequest, res: NextApiResponse<ICompanyDirector[]>) {
  const significantControlRegister: ICompanyDirector[] = generateCompanyDirectors(API_PAGE_RECORDS_CORPORATE_STRUCTURE_COMPANY_DIRECTORS);
  
  res.status(200).json(significantControlRegister);
}
