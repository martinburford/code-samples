// Types
import { IDataAttributes } from "types/interfaces";

export interface ICompanyOverview extends IDataAttributes {
  /** Whether or not the role was extended or not */
  extended?: boolean;
  /** Where code samples for a role can be viewed */
  github?: {
    projects: {
      [key: string]: string;
    },
    role: string;
  };
  /** How many LinkedIn recommendations should be shown by default? */
  initiallyVisibleRecommendations?: number;
  /** All recommendations I received from the role */
  recommendations: {
    hasNoPhoto?: boolean;
    jobTitle: string;
    name: string;
    recommendation: string;
  }[];
  /** Should the recommendations heading be visible? */
  recommendationsHeadingVisible?: boolean;
  /** The main duties of the role */
  roleOverview?: string[];
  /** A brief summary of the job specifics */
  summary: {
    companyName: string;
    dates: {
      from: string;
      to: string;
    };
    jobTitle: string;
    location: string;
    logo: {
      height: number;
      width: number;
    };
  };
  /** Which technologies I used during the role */
  technologiesUsed?: string[];
  /** Should the component be contined within a <Card> component? */
  withinCard?: boolean;
}
