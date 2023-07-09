import React from "react";
import { Form, Field } from "react-final-form";
import { useSelector } from "react-redux";
import { withRouter } from "react-router-dom";

// Components
import { selectors } from "../../../../../store";
import AnchorLink from "../../../components/anchor-link";
import Button from "../../../components/button";
import Card from "../../../components/card";
import FooterLinks from "../../../components/footer-links";
import GenericRedirect from "../../../components/generic-redirect";
import Heading from "../../../components/heading";
import Page from "../../../components/page";
import ProgressStepper from "../../../components/progress-stepper";
import RequiredFields from "../../../components/form/required-fields";
import TypeAheadSearchAPI from "../../../components/form/type-ahead-search-api";

// Configuration
import { applicationURLs } from "../../../../configuration";
import metaData from "../../../../configuration/meta-data";

// Styles
import styles from "./address-lookup.module.scss";

// Types
import { IAddressLookup } from "./address-lookup.types";
import { IFormErrors } from "../../../components/form/form.types";
import { TProgressStepperItems } from "../../../components/progress-stepper/progress-stepper.types";

// Utilities
import { constructMetaPageTags } from "../../../../utilities/index-react";

// Component configuration / data
const progressStepperItems: TProgressStepperItems = {
  items: [
    {
      label: "Company",
      status: "inactive"
    },
    {
      label: "Address",
      status: "active"
    },
    {
      label: "Sign up",
      status: "inactive"
    }
  ]
};

const AddressLookup: React.FC<IAddressLookup> = ({ history }) => {
  // Redux data
  const { id: addressId, typeahead: addressTypeahead } = useSelector(selectors.registration.getAddress);
  const { name: companyName } = useSelector(selectors.registration.getCompany);

  // De-structured objects
  const { registration } = applicationURLs;
  const { PageRegistration } = Page;

  // Page title
  const metaPageTitle = constructMetaPageTags(metaData.registration.addressLookup);

  // Submit the form
  const onSubmit = () => {
    // With the form having successfully validated, re-direct to the required page
    const redirectUrl = addressId && addressTypeahead ? registration.yourDetails : registration.addressLookupConfirm;
    history.push(redirectUrl);
  };

  let formSubmit;

  return (
    <GenericRedirect url={registration.businessSignup} valuesToCheck={[{ key: "companyName", value: companyName }]}>
      <>
        {metaPageTitle}
        <PageRegistration showLogoBar={false} theme="town">
          <ProgressStepper items={progressStepperItems.items} />
          <Card>
            <Heading level={3} text="Please confirm the trading address for:" weight={500} />
            <br />
            <p className={styles["company-name"]}>{companyName}</p>
            <Form
              onSubmit={onSubmit}
              validate={(values) => {
                const errors: IFormErrors = {};
                const { "address-lookup": addressLookup } = values;

                // Company name
                if (!addressLookup) {
                  errors["address-lookup"] = "Address required";
                }

                return errors;
              }}
              render={({ dirty, form, handleSubmit }) => {
                formSubmit = handleSubmit;

                return (
                  <form onSubmit={dirty ? handleSubmit : (e) => e.preventDefault()}>
                    <RequiredFields />
                    <Field name="address-lookup">
                      {({ meta, input }) => {
                        return (
                          <TypeAheadSearchAPI
                            apiType="addressLookup"
                            error={meta.error}
                            form={form}
                            formLabel="address-lookup"
                            input={input}
                            placeholder="Type address or postcode to search"
                            required={true}
                            touched={meta.touched ? true : false}
                          />
                        );
                      }}
                    </Field>
                    <FooterLinks style="style1">
                      <Button disabled={!dirty} label="Next" onClick={(event) => formSubmit(event)} type="primary" />
                      <AnchorLink href={registration.businessSignup} label="Back" />
                    </FooterLinks>
                  </form>
                );
              }}
            />
          </Card>
        </PageRegistration>
      </>
    </GenericRedirect>
  );
};

export default withRouter(AddressLookup);
