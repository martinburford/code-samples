// Components
import Button from "@aigence/components/atoms/button";
import ButtonGroup from "@aigence/components/molecules/button-group";
import Grid from "@aigence/components/global/grid";
import Icon from "@aigence/components/atoms/icon";
import ImageZoom from "@aigence/components/molecules/image-zoom";
import ImageUpload from "@aigence/components/molecules/image-upload";
// import Notification from "@aigence/components/molecules/notification";
import Select from "@aigence/components/atoms/select";
import Textarea from "@aigence/components/atoms/textarea";
import Textfield from "@aigence/components/atoms/textfield";

// NPM imports
import { useMutation } from "@apollo/client";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSelector } from "react-redux";

// Redux
import { getExpensesExpenseTypeList } from "store/lists/slice";

// Scripts
import { createExpenseExpenseItemGQL, updateExpenseExpenseItemGQL } from "@aigence/scripts/apollo/services/expenses";
import { renderAsCurrency, removeFormDataIdPrefix } from "@aigence/scripts/utilities";
import { showPageNotification } from "@aigence/scripts/utilities/index-react";

// Types
import { EColours, ESizes } from "@aigence/types/enums";
import { IFormExpensesExpenseAddEdit, TOnExpenseSubmit, TUpdateNetValue, TUpdateTotalExpenseItem } from "@aigence/types/page/expenses/index.types";

const ExpensesExpenseAddEdit: React.FC<IFormExpensesExpenseAddEdit> = ({
  // Settings
  claimId,
  formId,
  rowId,
  mode,
  onComplete,

  // Form data
  created,
  description,
  merchant,
  netValue,
  receiptURL,
  total,
  type,
  vat,
}) => {
  // Hooks (effects)
  useEffect(() => {
    if (mode === "edit") {
      // Pre-populate form elements
      setValue(`${rowId}-description`, description ? description : "");
      setValue(`${rowId}-merchant`, merchant ? merchant : "");
      setValue(`${rowId}-net-value`, netValue ? renderAsCurrency(netValue / 100) : "");
      setValue(`${rowId}-total`, total ? renderAsCurrency(total / 100) : "");
      setValue(`${rowId}-type`, type.id ? type.id : "");
      setValue(`${rowId}-vat`, vat ? vat : "");

      // If the form is being edited, trigger a manual validation upon the initial pre-population
      setTimeout(() => trigger(), 1);
    }
  }, []);

  // Hooks (forms)
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    trigger,
    watch,
  } = useForm();

  // Hooks (GraphQL)
  const [createExpenseExpenseItem] = useMutation(createExpenseExpenseItemGQL);
  const [updateExpenseExpenseItem] = useMutation(updateExpenseExpenseItemGQL);

  // Hooks (redux)
  const expenseTypes = useSelector(getExpensesExpenseTypeList);

  // Monitor live form values (for live updates)
  const watchNetValue = watch(`${rowId}-net-value`);
  const watchVat = watch(`${rowId}-vat`);
  const watchTotal = watch(`${rowId}-total`);

  // Submit the form data to GraphQL
  const onSubmit: TOnExpenseSubmit = (data) => {
    // Remove the "[id-]"" prefix from the form field names in order to process the form values in a consistent way
    const { description, merchant, "net-value": netValue, vat: taxPercentage, type } = removeFormDataIdPrefix(data, String(rowId));
    const mutationData = {
      description,
      merchant,
      netValue: netValue * 100,
      taxPercentage: Number(taxPercentage),
      type: Number(type),
    };

    // Perform a different mutation based on the form submission type ("add" || "edit")
    if (mode === "edit") {
      // Any additional fields required for an update vs a create?
      mutationData["id"] = rowId;
      mutationData["receiptURL"] = "/receipt.png"; // ! TODO: this will need to eventually be dynamic based on the form field value

      updateExpenseExpenseItem({
        onCompleted: () => {
          // Once a mutation is successful, perform any success messaging and / or reset logic
          onSuccess();
        },
        variables: {
          input: mutationData,
          updateId: claimId,
        },
      });
    } else {
      createExpenseExpenseItem({
        onCompleted: () => {
          // Once a mutation is successful, perform any success messaging and / or reset logic
          onSuccess();
        },
        variables: {
          input: mutationData,
        },
      });
    }
  };

  // Once a mutation is successful, perform any success messaging and / or reset logic
  const onSuccess = () => {
    // Fetch the expense claims, in order to refresh the data table entries
    onComplete();

    // Remove all previous form values, since the submission was successful
    resetForm();

    switch (mode) {
      case "add":
        // Show an in-page notification, alerting the user to the creation of a new entry
        showPageNotification(`New expense added to Claim ${created ? created : "UNKNOWN"}`, "success");
        break;
      case "edit":
        // Show an in-page notification, alerting the user to the creation of a new entry
        showPageNotification(`Existing item for Claim ${created} updated`, "success");
        break;
    }
  };

  // Reset the form
  const resetForm = () => {
    // Reset react-hook-form
    reset({
      keepErrors: false,
      keepDirty: false,
    });

    // *** Textfield / Textarea / Radiolist / Checkbox / Dropdowns
    setValue(`${rowId}-description`, "");
    setValue(`${rowId}-merchant`, "");
    setValue(`${rowId}-net-value`, "");
    setValue(`${rowId}-type`, "");
    setValue(`${rowId}-vat`, "");
    setValue(`${rowId}-total`, "");
  };

  // Update the "Net value" based on the values of 1) currentVAT and 2) currentTotal
  const updateNetValue: TUpdateNetValue = (currentVAT, currentTotal) => {
    if (currentVAT && currentTotal) {
      // Refresh live values
      const newNetTotal = String((currentTotal / (1 + currentVAT)).toFixed(2));
      setValue(`${rowId}-net-value`, newNetTotal);
    }
  };

  // Update the grand total based on the values of 1) currentNetValue and 2) currentVAT
  const updateTotalExpenseItem: TUpdateTotalExpenseItem = (currentNetValue, currentVAT) => {
    if (currentVAT && currentNetValue) {
      // Refresh live values
      const newTotalValue = String((currentNetValue * (1 + currentVAT)).toFixed(2));
      setValue(`${rowId}-total`, newTotalValue);
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit((data) => onSubmit(data))}>
      <Grid.Row>
        <Grid.Col mobile={{ span: 12 }} desktop={{ span: 7 }}>
          <Grid.Row>
            <Grid.Col mobile={{ span: 12 }} desktop={{ span: 6 }}>
              <Textfield
                {...register(`${rowId}-merchant`, { required: true })}
                hasError={errors[`${rowId}-merchant`]?.type === "required"}
                help={{
                  showOnError: true,
                  text: "Enter the name of the business where the purchase was made",
                }}
                label="Merchant"
                name={`${rowId}-merchant`}
                placeholder=""
              />
            </Grid.Col>
            <Grid.Col mobile={{ span: 12 }} desktop={{ span: 6 }}>
              <Select
                {...register(`${rowId}-type`, { required: true })}
                fullWidth={true}
                hasError={errors[`${rowId}-type`]?.type === "required"}
                help={{
                  showOnError: true,
                  text: "Select the category that best fits your expense",
                }}
                id={`${rowId}-type`}
                items={expenseTypes}
                label="Type"
                placeholder="Please select"
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Textarea
                {...register(`${rowId}-description`)}
                dataAttributes={{ "data-component-spacing": "0" }}
                help={{
                  text: "Give a brief summary of the purchase and its purpose",
                }}
                label="Description"
                name={`${rowId}-description`}
                placeholder=""
                rows={2}
              />
            </Grid.Col>
          </Grid.Row>
        </Grid.Col>
        <Grid.Col mobile={{ span: 12 }} desktop={{ span: 3 }}>
          {receiptURL ? <ImageZoom dataAttributes={{ "data-component-spacing": "0" }} height={1280} src={receiptURL} width={1920} /> : <ImageUpload />}
        </Grid.Col>
        <Grid.Col mobile={{ span: 12 }} desktop={{ span: 2 }}>
          <Controller
            control={control}
            name={`${rowId}-net-value`}
            render={({ field: { onChange, name }, formState: { errors } }) => (
              <Textfield
                {...register(name, { required: true })}
                dataAttributes={{ "data-component-spacing": "xs" }}
                hasError={errors[name]?.type === "required"}
                help={{
                  showOnError: true,
                  text: "Help text for Net value",
                }}
                name={name}
                onChange={(e) => {
                  onChange(e);

                  // A new total can only be generated if the VAT AND a net value have been proivded
                  const currentVAT = Number(watchVat);
                  const currentNetValue = Number((e.target as HTMLInputElement).value);

                  updateTotalExpenseItem(currentNetValue, currentVAT);

                  // Since dependant form field values have been updated, the form must be re-validated in response to those updates
                  trigger([`${rowId}-total`]);
                }}
                placeholder=""
                prefix={<span className={EColours.NEUTRAL_5}>Net value £</span>}
              />
            )}
          />

          <Controller
            control={control}
            name={`${rowId}-vat`}
            render={({ field: { onChange, name }, formState: { errors } }) => (
              <Select
                {...register(name, { required: true })}
                dataAttributes={{ "data-component-spacing": "xs" }}
                hasError={errors[name]?.type === "required"}
                fullWidth={true}
                id={name}
                items={[
                  {
                    text: "17%",
                    value: 0.17,
                  },
                  {
                    text: "20%",
                    value: 0.2,
                  },
                ]}
                onChange={(e) => {
                  onChange(e);

                  // Calculate related values based on the existence of other form field values
                  const currentVAT = Number(e.target.value);
                  const currentNetValue = Number(watchNetValue);
                  const currentTotal = Number(watchTotal);

                  updateNetValue(currentVAT, currentTotal);
                  updateTotalExpenseItem(currentNetValue, currentVAT);

                  // Since dependant form field values have been updated, the form must be re-validated in response to those updates
                  trigger([`${rowId}-total`]);
                }}
                placeholder="VAT"
              />
            )}
          />

          <Controller
            control={control}
            name={`${rowId}-total`}
            render={({ field: { onChange, name }, formState: { errors } }) => (
              <Textfield
                {...register(name, { required: true })}
                dataAttributes={{ "data-component-spacing": "xs" }}
                hasError={errors[name]?.type === "required"}
                help={{
                  showOnError: true,
                  text: "Help text for Total",
                }}
                name={name}
                onChange={(e) => {
                  onChange(e);

                  // A new "Net total" can only be generated if the VAT AND a total have been proivded
                  const currentVAT = Number(watchVat);
                  const currentTotal = Number((e.target as HTMLInputElement).value);

                  updateNetValue(currentVAT, currentTotal);

                  // Since dependant form field values have been updated, the form must be re-validated in response to those updates
                  trigger([`${rowId}-net-value`]);
                }}
                placeholder=""
                prefix={<span className={EColours.NEUTRAL_5}>Total £</span>}
              />
            )}
          />

          <ButtonGroup alignment="right" dataAttributes={{ "data-component-spacing": "0" }}>
            <Button compact={true} isSubmit={true} prefixIcon={<Icon colour={EColours.WHITE} id="plusCircle" size={ESizes.XS} />} variant="primary">
              <>{mode === "edit" ? "Update" : "Add"} item</>
            </Button>
          </ButtonGroup>
        </Grid.Col>
      </Grid.Row>
    </form>
  );
};

export default ExpensesExpenseAddEdit;
