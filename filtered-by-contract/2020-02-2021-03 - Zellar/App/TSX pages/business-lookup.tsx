import React, { useEffect } from "react";
import { Form, Field } from "react-final-form";
import { useDispatch, useSelector } from "react-redux";
import { withRouter } from "react-router-dom";

// Components
import { actions, selectors } from "../../../../../store";
import AnchorLink from "../../../components/anchor-link";
import Button from "../../../components/button";
import Card from "../../../components/card";
import Checkbox from "../../../components/form/checkbox";
import FooterLinks from "../../../components/footer-links";
import Heading from "../../../components/heading";
import Page from "../../../components/page";
import ProgressStepper from "../../../components/progress-stepper";
import RequiredFields from "../../../components/form/required-fields";
import Textbox from "../../../components/form/textbox";

// Configuration
import { applicationURLs } from "../../../../configuration";
import metaData from "../../../../configuration/meta-data";

// Types
import { IBusinessLookup } from "./business-lookup.types";
import { IFormErrors, TOnSubmit } from "../../../components/form/form.types";
import { TProgressStepperItems } from "../../../components/progress-stepper/progress-stepper.types";

// Utilities
import { constructMetaPageTags } from "../../../../utilities/index-react";

// Component configuration / data
const progressStepperItems: TProgressStepperItems = {
  items: [
    {
      label: "Company",
      status: "active"
    },
    {
      label: "Address",
      status: "inactive"
    },
    {
      label: "Sign up",
      status: "inactive"
    }
  ]
};

const BusinessLookup: React.FC<IBusinessLookup> = ({ history }) => {
  // Dispatch actions to Redux
  const dispatch = useDispatch();

  // Redux data
  const { name: companyName } = useSelector(selectors.registration.getCompany);
  const consent = useSelector(selectors.registration.getConsent);

  // Is there any form pre-population to perform on the first page render only?
  useEffect(() => {
    // Check the form exists, as a server re-direct may be occurring due to <GenericRedirect>
    if (formElem) {
      if (companyName) {
        formElem.change("company-name", companyName);
      }

      // Check all pre-population for being empty, as this interferes with the forms dirty state if setting empty values (which are essentially pristine)
      formElem.change("consent", consent ? true : undefined);
    }
  }, []);

  // De-structured objects
  const { registration, signin } = applicationURLs;
  const { PageRegistration } = Page;

  // Page title
  const metaPageTitle = constructMetaPageTags(metaData.registration.businessLookup);

  // Submit the form
  const onSubmit: TOnSubmit = (values) => {
    const { "company-name": companyName } = values;

    // Save the company name to Redux
    dispatch(actions.registration.saveCompany({ companyName }));

    // With the form having successfully validated, re-direct to the required page
    history.push(registration.addressLookup);
  };

  let formElem;
  let formSubmit;

  return (
    <>
      {metaPageTitle}
      <PageRegistration showLogoBar={false} theme="town">
        <ProgressStepper centered={false} items={progressStepperItems.items} />
        <Card>
          <Heading level={3} text="What is the trading name of your business?" weight={500} />
          <Form
            onSubmit={onSubmit}
            validate={(values) => {
              const errors: IFormErrors = {};
              const { "company-name": companyName, consent } = values;

              // Company name
              if (!companyName) {
                errors["company-name"] = "Company name required";
              }

              // Validate Consent
              if (!consent) {
                errors.consent = "";
              }

              return errors;
            }}
            render={({ dirty, form, handleSubmit }) => {
              formElem = form;
              formSubmit = handleSubmit;

              return (
                <form onSubmit={dirty ? handleSubmit : (e) => e.preventDefault()}>
                  <RequiredFields />
                  <Field name="company-name">
                    {({ meta, input }) => {
                      return (
                        <Textbox
                          error={meta.error}
                          input={input}
                          placeholder="e.g. ABC Cars"
                          required={true}
                          touched={meta.touched ? true : false}
                          type="text"
                        />
                      );
                    }}
                  </Field>
                  <Field name="consent" type="checkbox">
                    {({ meta, input }) => {
                      return (
                        <Checkbox
                          error={meta.error}
                          input={input}
                          label="I have the authority to request and view information on the organisation above"
                          reduxChangeAction="registration.consentToggle"
                          required={true}
                          size="small"
                          touched={meta.touched ? true : false}
                          {...input}
                        />
                      );
                    }}
                  </Field>
                  <FooterLinks style="style1">
                    <Button
                      disabled={!dirty && !companyName}
                      label="Next"
                      onClick={(event) => formSubmit(event)}
                      type="primary"
                    />
                    <AnchorLink href={signin.getStarted} label="Already have an account? Log in." />
                  </FooterLinks>
                </form>
              );
            }}
          />
        </Card>
      </PageRegistration>
    </>
  );
};

export default withRouter(BusinessLookup);
