// Types
import {
  LIVE_SAVE,
  OVERWRITE_COMPANY_LOGO,
  REMOVE_UNSAVED_IMAGE_UPLOAD_LOGO,
  RESET_PROFILE,
  SAVE,
  SAVE_COMPANY_LOGO,
  TOverwriteCompanyLogo,
  TLiveSave,
  TSave,
  TSaveCompanyLogo
} from "./types";

const resetProfile = () => ({
  type: RESET_PROFILE
});

/******************/
/* Profile > Save */
/******************/

// Save a users profile data in real-time (when adjusting form data)
const liveSave: TLiveSave = ({ about, sector, subSector, telephone, website }) => ({
  type: LIVE_SAVE,
  payload: {
    about,
    sector,
    subSector,
    telephone,
    website
  }
});

// Remove any Redux stored image upload (which has not been sent to the API)
const removeUnsavedImageUploadLogo = () => ({
  type: REMOVE_UNSAVED_IMAGE_UPLOAD_LOGO
});

// Save a users profile data in response to retrieving it from the API
const save: TSave = (profileData) => {
  return {
    type: SAVE,
    payload: profileData
  };
};

// Save a company logo (as image upload)
const saveCompanyLogo: TSaveCompanyLogo = (base64ImageData) => ({
  type: SAVE_COMPANY_LOGO,
  payload: base64ImageData
});

// Save a company logo (as image upload)
const overwriteCompanyLogo: TOverwriteCompanyLogo = (base64ImageData) => ({
  type: OVERWRITE_COMPANY_LOGO,
  payload: base64ImageData
});

export { overwriteCompanyLogo, removeUnsavedImageUploadLogo, resetProfile, liveSave, save, saveCompanyLogo };
