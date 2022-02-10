// Interfaces

interface IProfileData {
  companies: {
    /** The business description */
    about: string;
    /** The unique company id */
    companyId: number;
    /** The company name */
    companyName: string;
    /** The companies full address */
    fullAddress: string;
    /** The images provided by the user via image upload */
    images: {
      /** The base64 of an uploaded image */
      base64: string;
      /** The image type */
      type: string;
      /** The temporary holding space for any new company logos which have yet to be saved to the profile (via the API) */
      unsaved: string;
    }[];
    /** Whether this company is the main company of the profile */
    isMain: boolean;
    /** The latitude co-ordinate of the trading address */
    latitude: number;
    /** The longitude co-ordinate of the trading address */
    longitude: number;
    /** The dropdown value for the sector */
    sector: number | string;
    /** The dropdown value for the sub-sector */
    subSector: number | string;
    /** The companies telephone number */
    telephone: string;
    /** The companies website address */
    website: string;
  }[];
  /** The main contacts first name */
  firstName: string;
  /** The main contacts last name */
  lastName: string;
  /** Whether or not a profile has been generated */
  profileExists: boolean;
  /** The unique profile id */
  profileId: number;
}

export interface IProfileState extends IProfileData {}

// Types

export type TOverwriteCompanyLogo = (
  /** The base64 data for the image being saved */
  base64ImageData: string | ArrayBuffer | null
) => void;

export type TLiveSave = (profileData: {
  /** The business description */
  about: string;
  /** Which sector the company belongs to */
  sector: number;
  /** Which sub-sector the company belongs to */
  subSector: number;
  /** The companies telephone number */
  telephone: string;
  /** The companies website address */
  website: string;
}) => void;

export type TPrePopulateForm = (
  /** The business description */
  about: string,
  /** Which sector the company belongs to */
  sector: number,
  /** Which sub-sector the company belongs to */
  subSector: number,
  /** The companies telephone number */
  telephone: string,
  /** The companies website address */
  website: string
) => void;

export type TSave = (profileData: IProfileData) => void;

export type TSaveCompanyLogo = (
  /** The base64 data for the image being saved */
  base64ImageData: string | ArrayBuffer | null
) => void;

// Constants

export const LIVE_SAVE = "LIVE_SAVE";
export const OVERWRITE_COMPANY_LOGO = "OVERWRITE_COMPANY_LOGO";
export const REMOVE_UNSAVED_IMAGE_UPLOAD_LOGO = "REMOVE_UNSAVED_IMAGE_UPLOAD_LOGO";
export const RESET_PROFILE = "RESET_PROFILE";
export const SAVE = "SAVE";
export const SAVE_COMPANY_LOGO = "SAVE_COMPANY_LOGO";
