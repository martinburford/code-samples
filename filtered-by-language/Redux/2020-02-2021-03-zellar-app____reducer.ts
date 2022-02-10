import {
  IProfileState,
  OVERWRITE_COMPANY_LOGO,
  REMOVE_UNSAVED_IMAGE_UPLOAD_LOGO,
  RESET_PROFILE,
  LIVE_SAVE,
  SAVE,
  SAVE_COMPANY_LOGO
} from "./types";

const defaultProfileState: IProfileState = {
  companies: [
    {
      about: "",
      companyId: -1,
      companyName: "",
      fullAddress: "",
      images: [
        {
          base64: "",
          type: "background",
          unsaved: ""
        },
        {
          base64: "",
          type: "profile",
          unsaved: ""
        }
      ],
      isMain: false,
      latitude: -1,
      longitude: -1,
      sector: -1,
      subSector: -1,
      telephone: "",
      website: ""
    }
  ],
  firstName: "",
  lastName: "",
  profileExists: false,
  profileId: -1
};

export default (state: IProfileState = defaultProfileState, action) => {
  const firstCompany = state.companies[0];
  // const backgroundImage = firstCompany.images.filter((image) => image.type === "background"); // !For when background image logic is added Re: image upload
  const logoImage = firstCompany.images.filter((image) => image.type === "profile");

  switch (action.type) {
    // Save a users profile data in real-time (when adjusting form data)
    case LIVE_SAVE:
      return {
        ...state,
        companies: [
          {
            ...state.companies[0],
            ...action.payload
          }
        ]
      };

    // Save a company logo (as image upload)
    case OVERWRITE_COMPANY_LOGO:
      return {
        ...state,
        companies: [
          {
            ...firstCompany,
            images: [
              {
                ...firstCompany.images[0]
              },
              {
                ...logoImage[0],
                base64: action.payload
              }
            ]
          }
        ]
      };

    // Remove any Redux stored image upload (which has not been sent to the API)
    case REMOVE_UNSAVED_IMAGE_UPLOAD_LOGO:
      return {
        ...state,
        companies: [
          {
            ...firstCompany,
            images: [
              {
                ...firstCompany.images[0]
              },
              {
                ...logoImage[0],
                unsaved: ""
              }
            ]
          }
        ]
      };

    // Reset all Profile data
    case RESET_PROFILE:
      return defaultProfileState;

    // Save a users profile data in response to retrieving it from the API
    case SAVE:
      return action.payload;

    // Save a company logo (as image upload)
    case SAVE_COMPANY_LOGO:
      return {
        ...state,
        companies: [
          {
            ...firstCompany,
            images: [
              {
                ...firstCompany.images[0]
              },
              {
                ...logoImage[0],
                unsaved: action.payload
              }
            ]
          }
        ]
      };

    default:
      return { ...state };
  }
};
