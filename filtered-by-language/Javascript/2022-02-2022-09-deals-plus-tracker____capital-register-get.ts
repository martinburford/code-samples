// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

// Data lists
import {
  generateDocumentList,
  generateRandomDateThisMonth,
  generateRandomNumber,
  generateRandomTime,
  getRandomInstrumentTypeCapitalRegister,
  getRandomInvestedWith,
  getRandomTransactionType,
} from "pages/api/data-lists";

// Scripts
import { API_PAGE_RECORDS_CORPORATE_STRUCTURE_CAPITAL_STRUCTURE_CAPITAL_REGISTER } from "scripts/consts";

// Types
import { ICapitalRegister } from "types/pages/capital-structure/capital-register.types";

type TGenerateCapitalRegister = (total: number) => ICapitalRegister[];

const generateCapitalRegister: TGenerateCapitalRegister = (total) => {
  return [...Array(total)].map((_, index) => {
    const prefixedIndex = (index + 1).toString().padStart(2, "0");

    // Which form mode will 
    const typeOfTransaction = getRandomTransactionType();
    const instrumentName = getRandomInstrumentTypeCapitalRegister();

    const formMode = `${typeOfTransaction}-${instrumentName}`;

    const record: any = {
      id: index+1,
      addedBy: {
        date: generateRandomDateThisMonth(),
        name: "Venkat",
        time: generateRandomTime(),
      },
      dateOfTransaction: generateRandomDateThisMonth(),
      documents: generateDocumentList(),
      formMode,
      instrumentName,
      lastUpdatedBy: {
        date: generateRandomDateThisMonth(),
        name: "Ben",
        time: generateRandomTime(),
      },
      // notes: Math.random() < 0.5 ? `Notes ${prefixedIndex}` : "",
      notes: `Notes ${prefixedIndex}`,
      shareholder: `Shareholder ${prefixedIndex}`,
      typeOfTransaction,
      value: {
        currency: "gbp",
        total: Number(generateRandomNumber(2500, 150000)),
      },
    }

    switch(formMode){
      case "buyback-debt":
        record.transferee = `Transferee ${prefixedIndex}`;
        break;

      case "buyback-equity":
        record.numberOfShares = Number(generateRandomNumber(2500, 1500000));
        record.transferee = `Transferee ${prefixedIndex}`;
        break;

      case "cancellation-debt":
        break;
        
      case "cancellation-equity":
        record.numberOfShares = Number(generateRandomNumber(2500, 1500000));
        break;
        
      case "issuance-debt":
        record.investedWith = getRandomInvestedWith();
        record.loanGrantedBy = "";
        break;
        
      case "issuance-equity":
        record.investedWith = getRandomInvestedWith();
        record.loanGrantedBy = "";
        record.numberOfShares = Number(generateRandomNumber(2500, 1500000));
        break;
        
      case "transfer-debt":
        record.transferee = `Transferee ${prefixedIndex}`;
        break;
        
      case "transfer-equity":
        record.numberOfShares = Number(generateRandomNumber(2500, 1500000));
        record.transferee = `Transferee ${prefixedIndex}`;
        break;
    }

    return record;
  });
};

export default function handler(req: NextApiRequest, res: NextApiResponse<ICapitalRegister[]>) {
  const capitalRegister: ICapitalRegister[] = generateCapitalRegister(
    API_PAGE_RECORDS_CORPORATE_STRUCTURE_CAPITAL_STRUCTURE_CAPITAL_REGISTER
  );

  res.status(200).json(capitalRegister);
}
