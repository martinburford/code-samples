// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Field, Form, FormSpy } from "react-final-form";
import { withRouter } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Components
import { actions, selectors } from "../../../../../store";
import AxiosErrorHandler from "../../../components/axios-error-handler";
import Button from "../../../components/button";
import Grid from "../../../components/grid";
import Heading from "../../../components/heading";
import ImageUpload from "../../../components/image-upload";
import LogoWithBackdrop from "../../../components/logo-with-backdrop";
import Modal from "../../../components/modal";
import ModalCompact from "../../../components/modal-compact";
import Page from "../../../components/page";
import ProfileSummary from "../../../components/profile-summary";
import Select from "../../../components/form/select";
import Spinner from "../../../components/spinner";
import Textarea from "../../../components/form/textarea";
import Textbox from "../../../components/form/textbox";

// Configuration
import { applicationURLs, regularExpressions } from "../../../../configuration";
import metaData from "../../../../configuration/meta-data";

// Styles
import "../../../components/form/form.scss";
import styles from "./landing.module.scss";
import modalStyles from "../../../components/modal/modal.module.scss";
import pageStyles from "../../../components/page/profile/profile.module.scss";

// Types
import { FormApi } from "final-form";
import {
  IUseState,
  IUseStateSectors,
  ILanding,
  TFetchSectors,
  TFetchSubSectors,
  TOnAPISectorSelect,
  TPrePopulateForm,
  TSubmitImageUploadToAPI,
  TSubmitToAPI,
  TSwitchModalMode,
  TToggleMode,
  TToggleModalCompact,
  TUpdateFormDirty
} from "./landing.types";
import { IFormErrors, TOnSubmit } from "../../../components/form/form.types";

// Utilities
import { constructMetaPageTags } from "../../../../utilities/index-react";
import { apiReplaceKeys, constructAPIEndpoint, log, updateDisabledLoadingState } from "../../../../utilities";
import axios from "../../../../utilities/axios/signin";

const Landing: React.FC<ILanding> = ({ history }) => {
  const ref = React.createRef<HTMLButtonElement>();

  // Local component state
  const [state, updateState] = useState<IUseState>({
    axiosError: {
      apiReferrer: "",
      pageReferrer: "",
      status: -1
    },
    disabledLoadingElements: {
      btnApply: {
        disabled: false,
        loading: false
      },
      btnBack: {
        disabled: false,
        loading: false
      },
      btnSave: {
        disabled: false,
        loading: false
      }
    },
    isFormDirty: false,
    isModalLocked: false,
    isModalVisible: false,
    isModalCompactVisible: false,
    modalMode: "edit-profile" // "edit-profile" || "image-upload-logo"
  });

  // Local component sate
  const [sectorsState, updateSectorsState] = useState<IUseStateSectors>({
    activeSectorId: -1,
    activeSectorText: "",
    apiSectors: {
      data: [],
      isLoading: true
    },
    apiSubSectors: {
      data: [],
      isLoading: false
    }
  });

  // Load the profile data on the initial page load
  useEffect(() => {
    const fetchData = () => {
      axiosProfile
        .get(apiProfilesEndpoint, {
          withCredentials: true
        })
        .then((xhr) => {
          log(`[profile/landing.component.tsx]: API GET (SUCCESS) response, url=${apiProfilesEndpoint}`, xhr.data);

          // Does the profile already exist?
          const {
            value: { profileExists }
          } = xhr.data;
          // Does the profile exist?
          if (profileExists) {
            // IF IT DOES ... save the API response data to Redux
            constructProfileDataAndSaveToRedux(xhr.data);
          } else {
            // IF IT DOESN'T ... POST to the API in order to create the profile
            axiosProfile
              .post(apiProfilesEndpoint, {
                withCredentials: true
              })
              .then((xhr) => {
                constructProfileDataAndSaveToRedux(xhr.data);
              })
              .catch((error) => {
                log(
                  `[profile/landing.component.tsx]: API POST (ERROR) response, url=${apiProfilesEndpoint} {POST}`,
                  error.response
                );

                // Possible API error responses
                // ----
                // 401 => unauthorized
                // 403 => forbidden
                // 404 => not found
                // 500 => server error

                const { status: errorStatus } = error.response;

                // Store the error
                updateState({
                  ...state,
                  axiosError: {
                    apiReferrer: apiProfilesEndpoint,
                    pageReferrer: "profile.landing",
                    status: errorStatus
                  }
                });
              });
          }
        })
        .catch((error) => {
          log(`[profile/landing.component.tsx]: API GET (ERROR) response, url=${apiProfilesEndpoint}`, error.response);

          // Possible API error responses
          // ----
          // 401 => unauthorized
          // 403 => forbidden
          // 404 => not found
          // 500 => server error

          const { status: errorStatus } = error.response;

          switch (errorStatus) {
            case 401:
              // Token invalid / not found
              // Redirect to Get Started page to login
              return history.push(signin.getStarted);
            case 403:
              // The user doesn't have permission to access this particular API endpoint
              // Redirect to Get Started page to login
              return history.push(signin.getStarted);
            default:
              // Store the error
              updateState({
                ...state,
                axiosError: {
                  apiReferrer: apiProfilesEndpoint,
                  pageReferrer: "profile.landing",
                  status: errorStatus
                }
              });

              break;
          }
        });
    };

    // Only fetch Profile data if it hasn't already been requested (from a previous page visit)
    if (profileId === -1) {
      fetchData();
    }
  }, []);

  // Dispatch actions to Redux
  const dispatch = useDispatch();

  // Redux data
  const {
    companies: [
      {
        about,
        companyId,
        companyName,
        fullAddress,
        images: [
          // eslint-disable-next-line
          { base64: imageUploadBackgroundOriginal, unsaved: imageUploadBackgroundUnsaved }, // !For when background image logic is added Re: image upload
          { base64: imageUploadLogoOriginal, unsaved: imageUploadLogoUnsaved }
        ],
        sector,
        subSector,
        telephone,
        website
      }
    ],
    profileId
  } = useSelector(selectors.profile.getProfile);

  // Page title
  const metaPageTitle = constructMetaPageTags(metaData.profile.landing);

  // De-structured objects
  const { signin } = applicationURLs;
  const { instance: axiosProfile } = axios;
  const { PageProfile } = Page;
  const { IS_VALID_TELEPHONE, IS_VALID_WEBSITE } = regularExpressions;
  const {
    axiosError: { apiReferrer, pageReferrer, status },
    disabledLoadingElements: { btnApply, btnBack, btnSave },
    isFormDirty,
    isModalCompactVisible,
    isModalLocked,
    isModalVisible,
    modalMode
  } = state;
  const {
    activeSectorId,
    activeSectorText,
    apiSectors: { data: apiSectorsData, isLoading: apiSectorsIsLoading },
    apiSubSectors: { data: apiSubSectorsData, isLoading: apiSubSectorsIsLoading }
  } = sectorsState;

  useEffect(() => {
    console.log(ref);
    if (ref.current) {
      ref.current.style.border = "10px solid red";
    }
  }, [about]);

  // Automatically load the FULL sub-sector list for a sector, whenever the sector changes
  // This will also handle the initial load, so that the sub-sectors will show for a previously saved (parent) sector
  useEffect(() => {
    if (activeSectorId !== -1) {
      fetchSubSectors(activeSectorId);
    }
  }, [activeSectorId]);

  // Lookup the API endpoint(s)
  const apiProfilesEndpoint = constructAPIEndpoint({
    section: "profile",
    apiReference: "profiles"
  });

  // Image upload
  const apiImageUploadEndpoint = constructAPIEndpoint({
    section: "profile",
    apiReference: "imageUpload"
  });

  // Save profile
  const apiSaveEndpoint = constructAPIEndpoint({
    section: "profile",
    apiReference: "save"
  });

  // Sectors
  const apiSectorsEndpoint = constructAPIEndpoint({
    section: "profile",
    apiReference: "sectors"
  });

  // Sub-sectors
  const apiSubSectorsEndpoint = constructAPIEndpoint({
    section: "profile",
    apiReference: "subSectors"
  });

  // Construct Redux data structure from XHR response
  const constructProfileDataAndSaveToRedux = (xhrData) => {
    const {
      value: {
        companies: [
          {
            about,
            companyId,
            companyName,
            fullAddress,
            images,
            isMain,
            latitude,
            longitude,
            sector,
            subSector,
            telephone,
            website
          }
        ],
        firstName,
        lastName,
        profileExists,
        profileId
      }
    } = xhrData;

    // Check which image types have been sent down
    const backgroundImage = images.filter((image) => image.type === "background");
    const profileImage = images.filter((image) => image.type === "profile");

    // Default Redux state for Profile images
    const imagesForRedux = [
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
    ];

    // If a background image was provided by the API, save it to Redux
    if (backgroundImage.length === 1) {
      imagesForRedux[0] = {
        ...imagesForRedux[0],
        ...backgroundImage
      };
    }

    // If a profile image was provided by the API, save it to Redux
    if (profileImage.length === 1) {
      imagesForRedux[1] = {
        ...imagesForRedux[1],
        ...profileImage[0]
      };
    }

    // Construct the data object inline with the Redux schema for profiles
    const profileData = {
      companies: [
        {
          about,
          companyId,
          companyName,
          fullAddress,
          images: imagesForRedux,
          isMain,
          latitude,
          longitude,
          sector,
          subSector,
          telephone,
          website
        }
      ],
      firstName,
      lastName,
      profileExists,
      profileId
    };

    // Save a users profile data in response to retrieving it from the API
    dispatch(actions.profile.save(profileData));

    // Pre-populate the form values with the response from the GET API request
    // There is no need to wait for the Sectors to load in order to pre-populate the rest of the form
    prePopulateForm([
      {
        fieldName: "about",
        value: about
      },
      {
        fieldName: "telephone",
        value: telephone
      },
      {
        fieldName: "website",
        value: website
      }
    ]);

    // Fetch the sectors
    fetchSectors(sector);
  };

  // Fetch the sectors
  const fetchSectors: TFetchSectors = (sectorId) => {
    axiosProfile
      .get(apiSectorsEndpoint, {
        withCredentials: true
      })
      .then((xhr) => {
        log(`[profile/landing.component.tsx]: API GET (SUCCESS) response, url=${apiSectorsEndpoint}`, xhr.data);

        const { value: sectors } = xhr.data;

        // When the sectors are loaded, add in an unshift first element to say "Please select sector"
        sectors.unshift({
          text: "Please select sector",
          value: -1
        });

        // Pre-populate the form values with the response from the GET API request
        prePopulateForm([
          {
            fieldName: "sector",
            value: sectorId
          }
        ]);

        // Locate the active sector text
        const sectorText = sectors.find((sector) => sector.value == sectorId).text;

        updateSectorsState({
          ...sectorsState,
          activeSectorId: sectorId,
          activeSectorText: sectorText,
          apiSectors: {
            ...sectorsState.apiSectors,
            data: sectors,
            isLoading: false
          }
        });
      })
      .catch((error) => {
        log(
          `[profile/landing.component.tsx]: API GET (ERROR) response, url=${apiSectorsEndpoint} {GET}`,
          error.response
        );

        // Possible API error responses
        // ----
        // 401 => unauthorized
        // 403 => forbidden

        const { status: errorStatus } = error.response;

        updateState({
          ...state,
          axiosError: {
            apiReferrer: apiSectorsEndpoint,
            pageReferrer: "profile.landing",
            status: errorStatus
          }
        });
      });
  };

  // Fetch the sub-sectors for the selected sector
  const fetchSubSectors: TFetchSubSectors = (sectorId) => {
    // Don't fetch subsectors is there's no valid sector selected
    if (sectorId === -1) return;

    // Put the dropdown into a visual loading state
    updateSectorsState({
      ...sectorsState,
      apiSubSectors: {
        ...sectorsState.apiSubSectors,
        isLoading: true
      }
    });

    // Inject the necessary dynamic values into the necessary API endpoint URL
    const apiSubSectorsEndpointFormatted = apiReplaceKeys(apiSubSectorsEndpoint, [
      {
        key: "{SECTOR_ID}",
        value: sectorId
      }
    ]);

    axiosProfile
      .get(apiSubSectorsEndpointFormatted, {
        withCredentials: true
      })
      .then((xhr) => {
        log(
          `[profile/landing.component.tsx]: API GET (SUCCESS) response, url=${apiSubSectorsEndpointFormatted}`,
          xhr.data
        );

        const { value: subSectors } = xhr.data;

        // When the sub-sectors are loaded, add in an unshift first element to say "Please select sub-sector"
        subSectors.unshift({
          text: "Please select sub-sector",
          value: -1
        });

        // Save the sub-sectors in component state, so they can be passed down to the sub-sector <Select> instance
        updateSectorsState({
          ...sectorsState,
          apiSubSectors: {
            data: subSectors,
            isLoading: false
          }
        });

        formElem.change("subSector", subSector);

        // Pre-populate the form values with the response from the GET API request
        prePopulateForm([
          {
            fieldName: "subSector",
            value: subSector
          }
        ]);
      })
      .catch((error) => {
        log(
          `[profile/landing.component.tsx]: API GET (ERROR) response, url=${apiSubSectorsEndpointFormatted} {GET}`,
          error.response
        );

        // Possible API error responses
        // ----
        // 401 => unauthorized
        // 403 => forbidden

        const { status: errorStatus } = error.response;

        updateState({
          ...state,
          axiosError: {
            apiReferrer: apiSubSectorsEndpointFormatted,
            pageReferrer: "profile.landing",
            status: errorStatus
          }
        });
      });
  };

  // Store a reference to the selected Sector id, in order to be able to query the API for related sub-sectors
  const onAPISectorSelect: TOnAPISectorSelect = (sectorId) => {
    updateSectorsState({
      ...sectorsState,
      activeSectorId: sectorId,
      activeSectorText: sectorsState.apiSectors.data.find((sector) => sector.value == sectorId).text
    });
  };

  // Submit the form
  const onSubmit: TOnSubmit = (values) => {
    // Because the form fields aren't mandatory, defaults will have to be provided for the sake of the API, in order to fulfil the request successfully
    const fields = [
      {
        default: "",
        name: "about"
      },
      {
        default: "",
        name: "telephone"
      },
      {
        default: "",
        name: "website"
      },
      {
        default: -1,
        name: "sector"
      },
      {
        default: -1,
        name: "subSector"
      }
    ];

    const fieldValues: any = {};
    fields.map((field) => {
      fieldValues[field.name] = values[field.name] !== undefined ? values[field.name] : field.default;
    });

    // Convert the sectors to numerics, otherwise they will be strings
    fieldValues.sector = parseInt(fieldValues.sector);
    fieldValues.subSector = parseInt(fieldValues.subSector);

    console.log("Submit successful, VALUES:", values);
    console.log("Submit successful, FIELDVALUES:", fieldValues);

    // Toggle the loading state of the form submit button within the footer
    updateState({
      ...state,
      disabledLoadingElements: updateDisabledLoadingState(
        [
          {
            reference: "btnSave",
            type: "loading",
            value: true
          }
        ],
        state.disabledLoadingElements
      ),
      isModalLocked: true
    });

    // Submit the necessary API data to the /accounts endpoint
    submitToAPI(fieldValues);
  };

  // Pre-populate the form values with the response from the GET API request
  const prePopulateForm: TPrePopulateForm = (fieldData) => {
    // Check the form exists, as a server re-direct may be occurring due to <GenericRedirect>
    if (formElem) {
      fieldData.map((field) => {
        // Populate each form field with a provided value
        formElem.change(field.fieldName, field.value);
      });
    }
  };

  // Save the profile to the API
  const submitToAPI: TSubmitToAPI = (formData) => {
    // Inject the necessary dynamic values into the necessary API endpoint URL
    const apiSaveEndpointFormatted = apiReplaceKeys(apiSaveEndpoint, [
      {
        key: "{COMPANY_ID}",
        value: companyId
      }
    ]);

    // Since the API expects slightly different naming, re-construct the necessary key/value pair object, to satisfy the API
    const apiData = {
      about: formData.about,
      sectorId: formData.sector,
      subSectorId: formData.subSector,
      telephone: formData.telephone,
      website: formData.website
    };

    axiosProfile
      .patch(apiSaveEndpointFormatted, apiData, {
        withCredentials: true
      })
      .then((xhr) => {
        log(`[profile/landing.component.tsx]: API PATCH (SUCCESS) response, url=${apiSaveEndpointFormatted}`, xhr.data);

        // Update Redux with submitted data, so that it remains in synch with a successful profile save
        dispatch(actions.profile.liveSave(formData));

        // Having successfully updated their profile, hide the modal
        setTimeout(() => {
          toggleModal(false);
        }, 2500);
      })
      .catch((error) => {
        log(
          `[profile/landing.component.tsx]: API PATCH (ERROR) response, url=${apiSaveEndpointFormatted}`,
          error.response
        );

        // Possible API error responses
        // ----
        // 401 => unauthorized
        // 403 => forbidden
        // 500 => server error

        const { status: errorStatus } = error.response;

        updateState({
          ...state,
          axiosError: {
            apiReferrer: apiSaveEndpointFormatted,
            pageReferrer: "profile.landing",
            status: errorStatus
          }
        });
      });
  };

  // Submit the newly selected image to the API
  const submitImageUploadToAPI: TSubmitImageUploadToAPI = (imageUploadLogoUnsaved) => {
    const apiData = {
      companyId,
      imageBase64: imageUploadLogoUnsaved,
      type: "profile"
    };

    log(`[profile/landing.component.tsx]: Data PATCHed to ${apiImageUploadEndpoint}:`, apiData);

    // Submit the new company logo to the API
    axiosProfile
      .patch(apiImageUploadEndpoint, apiData, {
        withCredentials: true
      })
      .then((xhr) => {
        log(`[profile/landing.component.tsx]: API (SUCCESS) response, url=${apiImageUploadEndpoint}`, xhr);

        // Save the newly selected image to Redux
        dispatch(actions.profile.overwriteCompanyLogo(imageUploadLogoUnsaved));

        // Remove any Redux stored image upload (which has not been sent to the API)
        dispatch(actions.profile.removeUnsavedImageUploadLogo());

        // Switch to the main Edit Profile form
        switchModalMode("edit-profile");
      })
      .catch((error) => {
        log(`[profile/landing.component.tsx]: API (ERROR) response, url=${apiImageUploadEndpoint}`, error.response);

        // Possible API error responses
        // ----
        // 401 => invalid password
        // 500 => server error

        const { status: errorStatus } = error.response;

        // Store the error
        updateState({
          ...state,
          axiosError: {
            apiReferrer: apiImageUploadEndpoint,
            pageReferrer: "profile.landing",
            status: errorStatus
          }
        });
      });
  };

  // Switch the content which is rendered in the modal based on a "modalMode" value
  const switchModalMode: TSwitchModalMode = (mode) => {
    log("[profile/landing.component.tsx]: Switching to modal mode", mode);

    updateState({
      ...state,
      modalMode: mode
    });
  };

  // Toggle the visibility of the modal
  const toggleModal: TToggleMode = (visible) => {
    updateState({
      ...state,
      isModalVisible: visible,
      modalMode: visible ? "edit-profile" : modalMode
    });
  };

  // Toggle the visibility of the compact modal
  const toggleModalCompact: TToggleModalCompact = (visible, fullReset) => {
    updateState({
      ...state,
      isModalVisible: fullReset ? false : state.isModalVisible,
      isModalCompactVisible: visible
    });
  };

  const updateFormDirty: TUpdateFormDirty = (isDirty) => {
    // The setTimeout bypasses a well documented but related to FormSpy ... https://github.com/final-form/react-final-form/issues/809
    setTimeout(() => {
      updateState({
        ...state,
        isFormDirty: isDirty
      });
    }, 0);
  };

  let formElem: FormApi;
  let formSubmit;

  // Which image upload (logo) should be shown?
  // If an unsaved value is available in Redux, use that. If not, use the original (API provided) value
  const imageUploadLogoBase64Data = imageUploadLogoUnsaved ? imageUploadLogoUnsaved : imageUploadLogoOriginal;

  // Different modal states
  // 1. Default (Edit profile)
  // 2. Image upload (Logo)
  const modalConfiguration = {
    "edit-profile": {
      modalContent: (
        <>
          <ImageUpload
            base64Encode={imageUploadLogoBase64Data}
            dataAttributes={{ "data-no-margins": true }}
            mode="trigger"
            onSelect={() => switchModalMode("image-upload-logo")}
          />
          <br />
          <br />
          <div data-selector="form-split-2">
            <div>
              <Field name="sector">
                {({ input }) => {
                  return (
                    <Select
                      data={apiSectorsData}
                      form={formElem}
                      input={input}
                      loading={apiSectorsIsLoading}
                      onSelect={(sectorValue) => onAPISectorSelect(sectorValue)}
                      placeholder={apiSectorsData.length > 0 ? undefined : "Please select sector"}
                    />
                  );
                }}
              </Field>
            </div>
            <div>
              <Field name="subSector">
                {({ input }) => {
                  // Pre-populate if the API returned a value !== -1
                  // Leave empty if the API returned a value of -1
                  const initialSubSectorDataItem =
                    subSector !== -1
                      ? [
                          {
                            text: "",
                            value: subSector
                          }
                        ]
                      : [];

                  return (
                    <Select
                      data={apiSubSectorsData.length > 0 ? apiSubSectorsData : initialSubSectorDataItem}
                      form={formElem}
                      input={input}
                      loading={apiSubSectorsIsLoading}
                      placeholder={apiSubSectorsData.length > 0 ? undefined : "Please select sub-sector"}
                    />
                  );
                }}
              </Field>
            </div>
          </div>
          <Field name="about">
            {({ meta, input }) => {
              return (
                <Textarea
                  error={meta.error}
                  input={input}
                  maxlength={500}
                  placeholder="Description of your business (max. 500 words)"
                  touched={meta.touched}
                />
              );
            }}
          </Field>
          <div data-selector="form-split-2">
            <div>
              <Field name="website">
                {({ meta, input }) => {
                  return (
                    <Textbox
                      input={input}
                      error={meta.error}
                      placeholder="Website"
                      type="text"
                      touched={meta.touched}
                    />
                  );
                }}
              </Field>
            </div>
            <div>
              <Field name="telephone">
                {({ meta, input }) => {
                  return (
                    <Textbox
                      input={input}
                      error={meta.error}
                      placeholder="Business telephone"
                      type="tel"
                      touched={meta.touched}
                    />
                  );
                }}
              </Field>
            </div>
          </div>
          <br />
          <p>
            To update your business name or trading address, please contact our{" "}
            <a href="#" data-launch-intercom="true">
              Member Support team
            </a>
            .
          </p>
        </>
      ),
      modalFooter: (
        <Button
          disabled={btnSave.disabled || !isFormDirty}
          label="Save"
          loading={btnSave.loading}
          noMinimumWidth={true}
          onClick={(event) => formSubmit(event)}
          type="primary"
        />
      ),
      modalHeader: (
        <>
          <Heading level={3} text="Edit public profile" weight={600} />
          <p className={modalStyles["sub-heading"]}>These details will be visible on the Zellar directory.</p>
        </>
      )
    },
    "image-upload-logo": {
      modalContent: (
        <ImageUpload
          base64Encode={imageUploadLogoBase64Data}
          mode="upload"
          isModalLocked={isModalLocked}
          onSelect={() => switchModalMode("edit-profile")}
        />
      ),
      modalFooter: (
        <div className={modalStyles["footer-buttons"]}>
          <Button
            disabled={btnBack.disabled}
            label="Back"
            loading={btnBack.loading}
            noMinimumWidth={true}
            onClick={() => {
              // Remove any Redux stored image upload (which has not been sent to the API)
              dispatch(actions.profile.removeUnsavedImageUploadLogo());

              // Re-instate the Edit Profile modal form
              switchModalMode("edit-profile");
            }}
            type="secondary"
          />
          <Button
            disabled={imageUploadLogoUnsaved === "" || btnApply.disabled}
            label="Apply"
            loading={btnApply.loading}
            noMinimumWidth={true}
            onClick={() => {
              // Toggle button states which need to be locked whilst submitting the Company logo
              updateState({
                ...state,
                disabledLoadingElements: updateDisabledLoadingState(
                  [
                    {
                      reference: "btnApply",
                      type: "loading",
                      value: true
                    },
                    {
                      reference: "btnBack",
                      type: "disabled",
                      value: true
                    }
                  ],
                  state.disabledLoadingElements
                ),
                isModalLocked: true
              });

              // Submit the newly selected image to the API
              submitImageUploadToAPI(imageUploadLogoUnsaved);
            }}
            type="primary"
          />
        </div>
      ),
      modalHeader: (
        <>
          <Heading level={3} text="Profile image" weight={600} />
        </>
      )
    }
  };

  // What should load?
  // 1. A spinner whilst the call is made to the API
  // 2. The valid data once returned from the API
  const profileJSX =
    profileId !== -1 ? (
      <>
        <LogoWithBackdrop />
        <div className={styles["image-upload"]}>
          <ImageUpload
            base64Encode={imageUploadLogoBase64Data}
            dataAttributes={{ "data-no-margins": true }}
            mode="trigger"
            onSelect={() => toggleModal(true)}
          />
        </div>
        <ProfileSummary
          address={fullAddress}
          base64Encode={imageUploadLogoBase64Data}
          companyName={companyName}
          telephone={telephone}
          sector={activeSectorId !== -1 ? activeSectorText : ""}
          website={website}
        />
        <div className={styles.profile}>
          <Grid.Row>
            <Grid.Col mobile={{ span: 12 }} tablet={{ span: 12 }} desktop={{ span: 6 }}>
              <Heading level={4} text="About" weight={500} />
              {about !== "" ? (
                <p>{about}</p>
              ) : (
                <a href="#" onClick={() => toggleModal(true)}>
                  Tell us about your business
                </a>
              )}
            </Grid.Col>
            <Grid.Col mobile={{ span: 12 }} tablet={{ span: 12 }} desktop={{ span: 6 }}>
              <Heading level={4} text="My badges" weight={500} />
              <a href="#">See all badges</a>
            </Grid.Col>
          </Grid.Row>
        </div>
      </>
    ) : (
      <div className={pageStyles.loading}>
        <br />
        <p>Please wait...</p>
        <br />
        <Spinner color="tree" size="large" />
      </div>
    );

  return (
    <AxiosErrorHandler apiReferrer={apiReferrer} pageReferrer={pageReferrer} status={status}>
      <>
        {metaPageTitle}
        <PageProfile>{profileJSX}</PageProfile>
        <Form
          onSubmit={onSubmit}
          validate={(values) => {
            const errors: IFormErrors = {};
            const { telephone, website } = values;

            // Telephone
            if (telephone) {
              // Check that the telephone is of a valid format
              if (!IS_VALID_TELEPHONE.test(telephone)) {
                errors.telephone = "Invalid telephone number";
              }
            }

            // Website
            if (website) {
              // Check that the website is of a valid format
              if (!IS_VALID_WEBSITE.test(website)) {
                errors.website = "Invalid website format";
              }
            }

            return errors;
          }}
          render={({ dirty, form, handleSubmit }) => {
            formElem = form;
            formSubmit = handleSubmit;

            return (
              <>
                <Modal
                  footer={{
                    alignment: "right",
                    content: modalConfiguration[modalMode].modalFooter
                  }}
                  header={modalConfiguration[modalMode].modalHeader}
                  isContentHidden={isModalCompactVisible}
                  isLocked={isModalLocked}
                  onClose={() => toggleModalCompact(true)}
                  visible={isModalVisible}
                >
                  <>
                    <FormSpy
                      subscription={{ dirty: true }}
                      onChange={({ dirty }) => {
                        updateFormDirty(dirty);
                      }}
                    />
                    <form noValidate onSubmit={dirty ? handleSubmit : (e) => e.preventDefault()}>
                      {modalConfiguration[modalMode].modalContent}
                    </form>
                  </>
                </Modal>
                <ModalCompact visible={isModalCompactVisible}>
                  <>
                    <Heading level={4} text="Are you sure you want to exit?" weight={600} />
                    <br />
                    <p>
                      Any updates you've made to
                      <br />
                      your profile won't be saved.
                    </p>
                    <br />
                    <Button
                      label="Cancel"
                      noMinimumWidth={true}
                      onClick={() => toggleModalCompact(false)}
                      type="secondary"
                    />
                    <Button
                      label="Exit"
                      noMinimumWidth={true}
                      onClick={() => {
                        // Pre-populate the form values with the response from the GET API request
                        // There is no need to wait for the Sectors to load in order to pre-populate the rest of the form
                        prePopulateForm([
                          {
                            fieldName: "sector",
                            value: sector
                          },
                          {
                            fieldName: "about",
                            value: about
                          },
                          {
                            fieldName: "telephone",
                            value: telephone
                          },
                          {
                            fieldName: "website",
                            value: website
                          }
                        ]);

                        // Fetch the sub-sectors for the selected sector
                        // This will also perform the pre-population of the sub-sector (if there is one to pre-select)
                        fetchSubSectors(sector);

                        // Toggle the visibility of the modal
                        toggleModal(false);

                        // Toggle the visibility of the compact modal
                        toggleModalCompact(false, true);
                      }}
                      type="primary"
                    />
                  </>
                </ModalCompact>
              </>
            );
          }}
        />
      </>
    </AxiosErrorHandler>
  );
};

export default withRouter(Landing);
