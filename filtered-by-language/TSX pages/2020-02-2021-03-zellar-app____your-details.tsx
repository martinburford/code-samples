import React, { useEffect, useState } from "react";
import { Form, Field } from "react-final-form";
import { useDispatch, useSelector } from "react-redux";
import { withRouter } from "react-router-dom";

// Components
import { actions, selectors } from "../../../../../store";
import AnchorLink from "../../../components/anchor-link";
import AxiosErrorHandler from "../../../components/axios-error-handler";
import Button from "../../../components/button";
import Card from "../../../components/card";
import Checkbox from "../../../components/form/checkbox";
import FooterLinks from "../../../components/footer-links";
import GenericRedirect from "../../../components/generic-redirect";
import Heading from "../../../components/heading";
import Page from "../../../components/page";
import Password from "../../../components/form/password";
import ProgressStepper from "../../../components/progress-stepper";
import RequiredFields from "../../../components/form/required-fields";
import Textbox from "../../../components/form/textbox";

// Configuration
import { applicationURLs, regularExpressions } from "../../../../configuration";
import metaData from "../../../../configuration/meta-data";

// Styles
import "../../../components/form/form.scss";

// Types
import { IUseState, IYourDetails, TSubmitToAPI } from "./your-details.types";
import { IFormErrors, TOnSubmit } from "../../../components/form/form.types";
import { TProgressStepperItems } from "../../../components/progress-stepper/progress-stepper.types";

// Utilities
import { constructAPIEndpoint, log, updateDisabledLoadingState } from "../../../../utilities";
import { constructMetaPageTags } from "../../../../utilities/index-react";
import axios from "../../../../utilities/axios/registration";

// Component configuration / data
const progressStepperItems: TProgressStepperItems = {
  items: [
    {
      label: "Company",
      status: "inactive"
    },
    {
      label: "Address",
      status: "inactive"
    },
    {
      label: "Sign up",
      status: "active"
    }
  ]
};

const YourDetails: React.FC<IYourDetails> = ({ history }) => {
  // Local component state
  const [state, updateState] = useState<IUseState>({
    axiosError: {
      apiReferrer: "",
      pageReferrer: "",
      status: -1
    },
    disabledLoadingElements: {
      btnSubmit: {
        disabled: false,
        loading: false
      }
    }
  });

  // Dispatch actions to Redux
  const dispatch = useDispatch();

  // Redux data
  const {
    id: addressId,
    manual: {
      line1: addressLine1,
      line2: addressLine2,
      town: addressTown,
      county: addressCounty,
      postcode: addressPostcode
    },
    typeahead: addressTypeahead
  } = useSelector(selectors.registration.getAddress);
  const isConsent = useSelector(selectors.registration.getConsent);
  const { name: companyName } = useSelector(selectors.registration.getCompany);
  const { acceptZellar, email, firstName, keepMeUpdated, lastName, password, telephone } = useSelector(
    selectors.registration.getPersonalDetails
  );

  // Is there any form pre-population to perform on the first page render only?
  useEffect(() => {
    // Check the form exists, as a server re-direct may be occurring due to <GenericRedirect>
    if (formElem) {
      // Checkbox pre-population is different to textfields
      formElem.change("accept-zellar", acceptZellar ? true : undefined);
      formElem.change("keep-me-updated", keepMeUpdated ? true : undefined);

      if (email) {
        formElem.change("email", email);
      }
      if (firstName) {
        formElem.change("first-name", firstName);
      }
      if (lastName) {
        formElem.change("last-name", lastName);
      }
      if (password) {
        formElem.change("password", password);
      }
      if (telephone) {
        formElem.change("telephone", telephone);
      }
    }
  }, [acceptZellar, keepMeUpdated]);

  // De-structured objects
  const { registration } = applicationURLs;
  const { instance: axiosRegistration } = axios;
  const { EMAIL, IS_VALID_NAME, IS_VALID_PASSWORD, IS_VALID_TELEPHONE } = regularExpressions;
  const { PageRegistration } = Page;
  const {
    axiosError: { apiReferrer, pageReferrer, status },
    disabledLoadingElements: { btnSubmit }
  } = state;

  // Page title
  const metaPageTitle = constructMetaPageTags(metaData.registration.yourDetails);

  // Lookup the API endpoint
  const apiEndpoint = constructAPIEndpoint({
    section: "signin",
    apiReference: "accountCreate"
  });

  // Submit the form
  const onSubmit: TOnSubmit = (values) => {
    const {
      "accept-zellar": acceptZellar,
      email,
      "first-name": firstName,
      "last-name": lastName,
      "keep-me-updated": keepMeUpdated,
      password,
      telephone
    } = values;

    // Save personal details
    dispatch(
      actions.registration.savePersonalDetails({
        acceptZellar,
        email,
        firstName,
        keepMeUpdated,
        lastName,
        password,
        telephone
      })
    );

    // Construct the data object to send to the API, based on Redux contents
    const accountDetails = {
      addressCounty,
      addressId,
      addressLine1,
      addressLine2,
      addressPostcode,
      addressTown,
      companyName,
      email,
      firstName,
      isConsent,
      lastName,
      password,
      telephone
    };

    // Toggle the loading state of the form submit button within the footer
    updateState({
      ...state,
      disabledLoadingElements: updateDisabledLoadingState(
        [
          {
            reference: "btnSubmit",
            type: "loading",
            value: true
          }
        ],
        state.disabledLoadingElements
      )
    });

    // Submit the necessary API data to the /accounts endpoint
    submitToAPI(accountDetails);
  };

  // POST data to the API
  const submitToAPI: TSubmitToAPI = (accountDetails) => {
    // Don't log passwords
    log(`[registration/your-details.component.tsx]: Data POSTed to ${apiEndpoint}:`, accountDetails);

    axiosRegistration
      .post(apiEndpoint, accountDetails, {
        withCredentials: true
      })
      .then((xhr) => {
        log(`[registration/your-details.component.tsx]: API (SUCCESS) response, url=${apiEndpoint}`, xhr);

        // If an account was successfully created, re-direct to the "Account activation" page
        history.push(registration.accountCreated);
      })
      .catch((error) => {
        log(`[registration/your-details.component.tsx]: API (ERROR) response, url=${apiEndpoint}`, error.response);

        // Possible API error responses
        // 401 => unauthorized
        // 409 => conflict
        // 500 => server error

        const { status: errorStatus } = error.response;

        switch (errorStatus) {
          case 401:
            // User account not found
            return history.push(registration.accountCreated);
          default:
            // Store the error
            updateState({
              ...state,
              axiosError: {
                apiReferrer: apiEndpoint,
                pageReferrer: "registration.yourDetails",
                status: errorStatus
              }
            });

            break;
        }
      });
  };

  let formElem;
  let formSubmit;

  return (
    <GenericRedirect url={registration.businessSignup} valuesToCheck={[{ key: "companyName", value: companyName }]}>
      <AxiosErrorHandler apiReferrer={apiReferrer} pageReferrer={pageReferrer} status={status}>
        <>
          {metaPageTitle}
          <PageRegistration showLogoBar={false} theme="town">
            <ProgressStepper items={progressStepperItems.items} />
            <Card>
              <Heading level={3} text="Please enter your personal details" weight={500} />
              <br />
              <p>We need a few more details to finish setting up your account.</p>
              <Form
                onSubmit={onSubmit}
                validate={(values) => {
                  const errors: IFormErrors = {};
                  const {
                    "accept-zellar": acceptZellar,
                    email,
                    "first-name": firstName,
                    "last-name": lastName,
                    password,
                    telephone
                  } = values;

                  // First name
                  if (!firstName) {
                    errors["first-name"] = "First name required";
                  } else {
                    // Check if the First name is of the correct format (no numbers allowed)
                    if (!IS_VALID_NAME.test(firstName)) {
                      errors["first-name"] = "Invalid name format";
                    }
                  }

                  // Last name
                  if (!lastName) {
                    errors["last-name"] = "Last name required";
                  } else {
                    // Check if the last name is of the correct format (no numbers allowed)
                    if (!IS_VALID_NAME.test(lastName)) {
                      errors["last-name"] = "Invalid name format";
                    }
                  }

                  // Telephone
                  if (telephone) {
                    // Check that the telephone is of a valid format
                    if (!IS_VALID_TELEPHONE.test(telephone)) {
                      errors.telephone = "Invalid telephone number";
                    }
                  }

                  // Email
                  if (!email) {
                    errors.email = "Email required";
                  } else {
                    // Check if the email address format is valid
                    if (!EMAIL.test(email)) {
                      errors.email = "Invalid email address format";
                    }
                  }

                  // Password
                  if (!password) {
                    errors.password = "Password required";
                  } else {
                    // Check if the password format is valid
                    if (!IS_VALID_PASSWORD.test(password)) {
                      errors.password = "Invalid password format";
                    }
                  }

                  // Accept Zellar
                  if (!acceptZellar) {
                    errors["accept-zellar"] = "";
                  }

                  return errors;
                }}
                render={({ dirty, form, handleSubmit }) => {
                  formElem = form;
                  formSubmit = handleSubmit;

                  return (
                    <form noValidate onSubmit={dirty ? handleSubmit : (e) => e.preventDefault()}>
                      <RequiredFields />
                      <div data-selector="form-split-2">
                        <div>
                          <Field name="first-name">
                            {({ meta, input }) => {
                              return (
                                <Textbox
                                  input={input}
                                  error={meta.error}
                                  placeholder="First name"
                                  required={true}
                                  type="text"
                                  touched={meta.touched}
                                />
                              );
                            }}
                          </Field>
                        </div>
                        <div>
                          <Field name="last-name">
                            {({ meta, input }) => {
                              return (
                                <Textbox
                                  input={input}
                                  error={meta.error}
                                  placeholder="Last name"
                                  required={true}
                                  type="text"
                                  touched={meta.touched}
                                />
                              );
                            }}
                          </Field>
                        </div>
                      </div>
                      <Field name="telephone">
                        {({ meta, input }) => {
                          return (
                            <Textbox
                              input={input}
                              error={meta.error}
                              placeholder="Telephone"
                              required={true}
                              type="tel"
                              touched={meta.touched}
                            />
                          );
                        }}
                      </Field>
                      <Field name="email">
                        {({ meta, input }) => {
                          return (
                            <Textbox
                              input={input}
                              error={meta.error}
                              placeholder="Email"
                              required={true}
                              type="email"
                              touched={meta.touched}
                            />
                          );
                        }}
                      </Field>
                      <Field name="password">
                        {({ meta, input }) => {
                          return (
                            <Password
                              input={input}
                              error={meta.error}
                              placeholder="Password"
                              required={true}
                              touched={meta.touched}
                            />
                          );
                        }}
                      </Field>
                      <Field name="accept-zellar" type="checkbox">
                        {({ meta, input }) => {
                          return (
                            <Checkbox
                              error={meta.error}
                              input={input}
                              label={
                                <span>
                                  I accept Zellar's{" "}
                                  <a href="https://zellar.com/terms-and-conditions/" target="_blank">
                                    Terms and Conditions
                                  </a>{" "}
                                  and{" "}
                                  <a href="https://zellar.com/privacy/" target="_blank">
                                    Privacy Policy
                                  </a>
                                  .
                                </span>
                              }
                              reduxChangeAction="registration.acceptZellarToggle"
                              required={true}
                              size="small"
                              touched={meta.touched ? true : false}
                              {...input}
                            />
                          );
                        }}
                      </Field>
                      <Field name="keep-me-updated" type="checkbox">
                        {({ meta, input }) => {
                          return (
                            <Checkbox
                              error={meta.error}
                              input={input}
                              label="Keep me updated on the latest news, promotions and offers from Zellar."
                              reduxChangeAction="registration.keepMeUpdatedToggle"
                              required={false}
                              size="small"
                              touched={meta.touched ? true : false}
                              {...input}
                            />
                          );
                        }}
                      </Field>
                      <FooterLinks style="style1">
                        <Button
                          disabled={btnSubmit.disabled || !dirty}
                          label="Create account"
                          loading={btnSubmit.loading}
                          onClick={(event) => formSubmit(event)}
                          type="primary"
                        />
                        <AnchorLink
                          href={
                            addressId && addressTypeahead
                              ? registration.addressLookup
                              : registration.addressLookupConfirm
                          }
                          label="Back"
                        />
                      </FooterLinks>
                    </form>
                  );
                }}
              />
            </Card>
          </PageRegistration>
        </>
      </AxiosErrorHandler>
    </GenericRedirect>
  );
};

export default withRouter(YourDetails);
