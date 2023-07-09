import type { NextApiRequest, NextApiResponse } from "next";

// Data
import {
  generateRandomDateThisMonth,
  getRandomInstrumentCompoundPeriod,
  getRandomInstrumentDayCountType,
  getRandomInstrumentInterestPeriodType,
  getRandomInstrumentTypeOfInterest,
  generateRandomNumber,
  getRandomBoolean,
  getRandomCurrency,
  getRandomInstrumentInterest,
  getRandomInstrumentType,
} from "pages/api/data-lists";

// Scripts
import { API_PAGE_RECORDS_CORPORATE_STRUCTURE_CAPITAL_STRUCTURE_INTRUMENTS } from "scripts/consts";

// Types
import { IInstrument } from "types/pages/capital-structure/instruments.types";

type TGenerateInstruments = (total: number) => IInstrument[];
// type TGenerateInstruments = (total: number) => any[];

const generateInstruments: TGenerateInstruments = (total) => {
  return [...Array(total)].map((_, index) => {
    const id = index + 1;
    const prefixedIndex = (index + 1).toString().padStart(2, "0");

    // Depending on the type ("coupon-bearing-equity" || "debt" || "equity" || "external-debt")
    // There is different data returned
    const type = getRandomInstrumentType();

    let name = `Instrument name ${prefixedIndex}`;
    let interestPeriodType = "";
    let fixedInterestPeriod = null;

    switch (type) {
      case "coupon-bearing-equity":
        interestPeriodType = getRandomInstrumentInterestPeriodType();
        if (interestPeriodType === "fixed") {
          fixedInterestPeriod = generateRandomDateThisMonth();
        }

        return {
          id,
          name,
          type,
          currency: getRandomCurrency(),
          dateOfFirstIssuance: generateRandomDateThisMonth(),
          voting: getRandomBoolean(),
          numberOfVotes: generateRandomNumber(1, 100),
          nominalValuePerShare: generateRandomNumber(1, 100),
          interestRateFixedOrFloating: getRandomInstrumentInterest(),
          interestRate: generateRandomNumber(3, 5),
          typeOfInterest: getRandomInstrumentTypeOfInterest(),
          interestPeriodType,
          fixedInterestPeriod,
          dayCountType: getRandomInstrumentDayCountType(),
          compoundingPeriod: getRandomInstrumentCompoundPeriod(),
        };
      case "debt":
        interestPeriodType = getRandomInstrumentInterestPeriodType();
        if (interestPeriodType === "fixed") {
          fixedInterestPeriod = generateRandomDateThisMonth();
        }

        return {
          id,
          name,
          type,
          currency: getRandomCurrency(),
          dateOfFirstIssuance: generateRandomDateThisMonth(),
          interestRateFixedOrFloating: getRandomInstrumentInterest(),
          interestRate: generateRandomNumber(3, 5),
          typeOfInterest: getRandomInstrumentTypeOfInterest(),
          interestPeriodType,
          fixedInterestPeriod,
          dayCountType: getRandomInstrumentDayCountType(),
          compoundingPeriod: getRandomInstrumentCompoundPeriod(),
          transferPricingRequired: getRandomBoolean(),
          transferPricingComments: `Transfer pricing comments ${prefixedIndex}`,
        };
      case "equity":
        return {
          id,
          name,
          type,
          dateOfFirstIssuance: generateRandomDateThisMonth(),
          voting: getRandomBoolean(),
          numberOfVotes: generateRandomNumber(1, 100),
          nominalValuePerShare: generateRandomNumber(1, 100),
          totalPool: generateRandomNumber(1, 100),
          participationThreshold: generateRandomNumber(1, 100) as number,
        };
      case "external-debt":
        interestPeriodType = getRandomInstrumentInterestPeriodType();
        if (interestPeriodType === "fixed") {
          fixedInterestPeriod = generateRandomDateThisMonth();
        }

        return {
          id,
          name,
          type,
          currency: getRandomCurrency(),
          nameOfDebt: `Debt ${prefixedIndex}`,
          loanDrawDate: generateRandomDateThisMonth(),
          interestRateFixedOrFloating: getRandomInstrumentInterest(),
          interestRate: generateRandomNumber(3, 5),
          typeOfInterest: getRandomInstrumentTypeOfInterest(),
          interestPeriodType,
          fixedInterestPeriod,
          hedging: getRandomBoolean(),
          hedgeKeyTerms: `Hedge key terms ${prefixedIndex}`,
        }
    }
  });
};

export default function handler(req: NextApiRequest, res: NextApiResponse<IInstrument[]>) {
  const instruments: IInstrument[] = generateInstruments(API_PAGE_RECORDS_CORPORATE_STRUCTURE_CAPITAL_STRUCTURE_INTRUMENTS);

  res.status(200).json(instruments);
}
