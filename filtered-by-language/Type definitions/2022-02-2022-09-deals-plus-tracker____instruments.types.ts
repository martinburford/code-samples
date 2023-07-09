// Interfaces
export interface IInstrument {
	id: number;
	name: string;
	type: "coupon-bearing-equity" | "debt" | "equity" | "external-debt";

	compoundingPeriod?: "daily" | "monthly" | "quarterly" | "bi-annually" | "annually" | "";
	currency?: string;
	dateOfFirstIssuance?: string | null;
	dayCountType?: "360" | "365" | "actual" | "";
	fixedInterestPeriod?: string | null;
	hedgeKeyTerms?: string;
	hedging?: boolean;
	interestIn?: "fixed" | "floating" | "";
	interestPeriodType?: "anniversary-of-issuance" | "fixed" | string;
	interestRate?: number | string;
	interestRateFixedOrFloating?: "fixed" | "floating" | "";
	loanDrawDate?: string | null;
	nameOfDebt?: string;
	nominalValuePerShare?: number | string;
	numberOfVotes?: number | string;
	participationThreshold?: number;
	totalPool?: number | string;
	transferPricingComments?: string;
	transferPricingRequired?: boolean;
	typeOfInterest?: "compound" | "simple" | "";
	voting?: boolean;
}

// Types
export type TDeleteInstrumentById = (id: number) => void;
export type TEditInstrument = (props: IInstrument) => void;
export type TFetchInstrumentById = (id: number) => IInstrument;
export type TViewInstrument = (props: IInstrument) => void;