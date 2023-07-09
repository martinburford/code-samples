// Components
import Breadcrumb from "components/atoms/breadcrumb";
import Button from "components/atoms/button";
import ContentBlockToInline from "components/atoms/content-block-to-inline";
import DatePicker from "components/molecules/date-picker";
import FlexStretch from "components/widgets/flex-stretch";
import GridColumnVisibility from "components/molecules/grid-column-visibility";
import GridFilterButtons from "components/molecules/grid-filter-buttons";
import GridFilters from "components/molecules/grid-filters";
import GridFiltersSummary from "components/widgets/grid-filters-summary";
import Heading from "components/atoms/heading";
import HeadingWithButtons from "components/molecules/heading-with-buttons";
import Icon from "components/atoms/icon";
import LayoutApp from "components/global/layouts/app";
import LinkList from "components/molecules/link-list";
import Modal from "components/atoms/modal";
import Select from "components/atoms/select";
import Tabs from "components/atoms/tabs";

// Forms
import Forms from "forms";
import debounce from "lodash.debounce";

// NPM imports
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";

// Redux
import { getAPICallBeingMade } from "store/global/slice";

// Scripts
import { getInstruments } from "scripts/axios/services/capital-structure/instruments";
import {
  AG_GRID_EDIT_BUTTON_AND_ICON_SETTINGS,
  AG_GRID_ICON_SETTINGS,
  AG_GRID_KEBAB_SETTINGS,
  AG_GRID_OPTIONS,
  AG_GRID_RESIZE_DEBOUNCE,
  DEFAULT_COLUMN_DEFINITIONS,
} from "scripts/consts";
import {
  capitalize,
} from "scripts/utilities";
import { dateComparator, onGridSizeChanged, registerAGGridLicence } from "scripts/utilities/ag-grid";
import {
  renderBooleanAsTickOrCross,
  renderFormattedPercentage,
  renderGridIcon,
  renderLink,
  renderStringCheck,
} from "scripts/utilities/ag-grid/index-react";
import PopupCellRenderer from "scripts/utilities/ag-grid/popup-cell-renderer";

// Types
import { ESizes } from "types/enums";
import { IColDef } from "types/interfaces";
import {
  IInstrument,
  TDeleteInstrumentById,
  TEditInstrument,
  TFetchInstrumentById,
  TViewInstrument,
} from "types/pages/capital-structure/instruments.types";

// Register AG Grid so that enterprise features can be used without watermarking
registerAGGridLicence();

const Instruments: NextPage = () => {
  // Hooks (refs)
  const agGridRef = useRef<AgGridReact>();
  const gridFiltersRef = useRef(null);

  // Hooks (selector)
  const apiCallBeingMade = useSelector(getAPICallBeingMade);

  // Hooks (state)
  const [activeFiltersTab, updateActiveFiltersTab] = useState(1);
  const [activeRowData, updateActiveRowData] = useState<IInstrument | {}>({});
  const [addEditModalMode, updateAddEditModalMode] = useState<"add" | "edit">("add");
  const [addEditModalVisible, updateAddEditModalVisibility] = useState(false);
  const [agGridLoaded, updateAgGridLoaded] = useState(false);
  const [deleteInstrumentId, updateDeleteInstrumentId] = useState(-1);
  const [deleteModalVisible, updateDeleteModalVisible] = useState(false);
  const [gridFiltersModal, updateGridFiltersModalVisible] = useState(false);
  const [rowData, updateRowData] = useState<IInstrument[] | null>(null);
  const [viewModalVisible, updateViewModalVisibility] = useState(false);

  // Hooks (effects)
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await getInstruments();

      // Save the raw row data in local component state
      updateRowData(data);
    };

    fetchData();
  }, []);

  // Define the columsn for the data grid
  const columnDefinitions: IColDef[] = [
    {
      ...AG_GRID_EDIT_BUTTON_AND_ICON_SETTINGS,
      ...AG_GRID_ICON_SETTINGS,
      cellRenderer: useCallback((params) => renderGridIcon(params), []),
      cellRendererParams: {
        // Show the delete modal, passing the unique record id for lookup purposes
        callback: (data) => {
          deleteInstrumentById(data.id);
        },
        iconId: "bin",
      },
    },
    {
      ...AG_GRID_EDIT_BUTTON_AND_ICON_SETTINGS,
      ...AG_GRID_ICON_SETTINGS,
      cellRenderer: useCallback((params) => renderGridIcon(params), []),
      cellRendererParams: {
        // Show the edit modal, with form data pre-populated
        callback: (data) => {
          updateAddEditModalMode("edit");
          editInstrument(data);
        },
        iconId: "edit"
      },
    },
    {
      ...AG_GRID_EDIT_BUTTON_AND_ICON_SETTINGS,
      ...AG_GRID_ICON_SETTINGS,
      cellRenderer: useCallback((params) => renderGridIcon(params), []),
      cellRendererParams: {
        // The the moment, just show an alert, with the id for the selected record
        callback: (data) => {
          alert(`Show report for id: ${data.id}`);
        },
        iconId: "pieChartSplit",
      },
    },
    {
      cellRenderer: useCallback((params) => renderLink(params), []),
      cellRendererParams: {
        // Show the edit modal, with form data pre-populated
        callback: (data) => {
          viewInstrument(data);
        },
        dataKeyName: "name",
        keyPrefix: "name-",
        linkPrefix: "/capital-structure/instruments",
      },
      externalFilter: "text",
      field: "name",
      filter: "agTextColumnFilter",
      headerName: "Name",
    },
    {
      externalFilter: "list",
      field: "type",
      filter: "agSetColumnFilter",
      filterParams: {
        valueFormatter: (params) => capitalize(params.value.toString().split("-").join(" ")),
      },
      headerName: "Type",
      valueFormatter: (params) => capitalize(params.data.type.split("-").join(" ")),
    },
    {
      cellClass: "cell-centre",
      cellRenderer: useCallback((params) => renderBooleanAsTickOrCross(params.data.voting), []),
      externalFilter: "list",
      filter: "agSetColumnFilter",
      filterParams: {
        valueFormatter: (params) => (params.value === "true" ? "Yes" : "No"),
      },
      field: "voting",
      headerClass: "cell-centre",
      headerName: "Voting",
      suppressSizeToFit: true,
      width: 80
    },
    {
      cellRenderer: useCallback((params) => renderFormattedPercentage(params.data.interestRate), []),
      field: "interestRate",
      filter: false,
      headerName: "Interest rate",
    },
    {
      cellRenderer: useCallback((params) => renderStringCheck(params.data.interestPeriodType), []),
      externalFilter: "list",
      field: "interestPeriodType",
      filter: "agSetColumnFilter",
      filterParams: {
        valueFormatter: (params) => (!params.value ? "N/a" : capitalize(params.value.toString()).split("-").join(" ")),
      },
      headerName: "Interest period type",
    },
    {
      cellRenderer: useCallback((params) => renderStringCheck(params.data.fixedInterestPeriod), []),
      externalFilter: "datepicker",
      field: "fixedInterestPeriod",
      filter: "agDateColumnFilter",
      filterParams: { comparator: dateComparator },
      headerName: "Fixed interest period",
    },
    {
      ...AG_GRID_KEBAB_SETTINGS,
      cellRenderer: PopupCellRenderer,
    },
  ];

  // Show the modal to delete a specific instrument
  const deleteInstrumentById: TDeleteInstrumentById = (id) => {
    updateDeleteInstrumentId(id);
    updateDeleteModalVisible(true);
  };

  // Pre-populate all Modal form fields with the correct data
  const editInstrument: TEditInstrument = (row) => {
    updateActiveRowData(row);
    updateAddEditModalMode("edit");
    updateAddEditModalVisibility(true);
  };

  // Grab the data for an instrument (matched against a unique instrument id)
  const fetchInstrumentById: TFetchInstrumentById = (id) => {
    return rowData.find((instrument) => instrument.id === id);
  };

  // Pre-populate all Modal (read-only) components with the correct data
  const viewInstrument: TViewInstrument = (row) => {
    updateActiveRowData(row);
    updateViewModalVisibility(true);
  };

  return (
    <>
      <Head>
        <title>Corporate Structure / Capital Structure</title>
      </Head>
      <LayoutApp stretchGridToFit={true}>
        <FlexStretch
          content={
            <AgGridReact
              {...AG_GRID_OPTIONS}
              columnDefs={useMemo(() => columnDefinitions, [])}
              defaultColDef={useMemo(() => DEFAULT_COLUMN_DEFINITIONS, [])}
              onDisplayedColumnsChanged={debounce(
                useCallback(() => onGridSizeChanged({ agGridRef }), []),
                AG_GRID_RESIZE_DEBOUNCE
              )}
              onFirstDataRendered={() => updateAgGridLoaded(true)}
              onGridSizeChanged={debounce(
                useCallback(() => onGridSizeChanged({ agGridRef }), []),
                AG_GRID_RESIZE_DEBOUNCE
              )}
              ref={agGridRef}
              rowData={rowData}
            />
          }
          header={
            <>
              <Breadcrumb
                items={[
                  { label: "Deal name", url: "#" },
                  { label: "Company name", url: "#" },
                  { label: "Capital structure", url: "#" },
                  { label: "Instruments" },
                ]}
              />
              <HeadingWithButtons
                buttons={[
                  <Select
                    disabled={apiCallBeingMade}
                    id="download"
                    key="download"
                    items={[
                      {
                        text: "A really long dropdown value",
                        value: 1,
                      },
                    ]}
                    placeholder="Download"
                    prefixIcon="download"
                    width={150}
                  />,
                  <Button
                    disabled={apiCallBeingMade}
                    key="button-2"
                    onClick={() => {
                      // Ensure the form state is reset before passing to the form
                      // Provide a unique id record, so that the form knows it's been refreshed and doesn't remain stale
                      // Form reset logic needs to be executed prior EVERY "add" request from a user 
                      updateActiveRowData({ id: Math.random() });

                      updateAddEditModalMode("add");
                      updateAddEditModalVisibility(true);
                    }}
                    prefixIcon={<Icon id="plusInCircle" />}
                    variant="primary"
                  >
                    Add new instrument
                  </Button>,
                ]}
                heading={<Heading variant={1}>Capital structure</Heading>}
              />
              <ContentBlockToInline
                gap={ESizes.M}
                inlineElementsFrom="tabletPortrait"
              >
                <Select
                  id="company-name"
                  items={[
                    {
                      text: "Item 1 text",
                      value: 1,
                    },
                  ]}
                  placeholder="Company name"
                  prefixIcon="office"
                />
                <GridFilterButtons
                  onColumnsClick={() => {
                    updateActiveFiltersTab(2);
                    updateGridFiltersModalVisible(true);
                  }} 
                  onFiltersClick={() => {
                    updateActiveFiltersTab(1);
                    updateGridFiltersModalVisible(true);
                  }}
                />
                <DatePicker 
                  onChange={(dates) => console.log("Date selected: " + dates)}
                  type="datepicker"
                />
              </ContentBlockToInline>
              <GridFiltersSummary />
              <LinkList
                active={3}
                items={[
                  {
                    text: "Capital register",
                    url: "/capital-structure/capital-register",
                  },
                  {
                    text: "Capital table",
                    url: "/capital-structure/capital-table",
                  },
                  {
                    text: "Instruments",
                    url: "/capital-structure/instruments",
                  },
                ]}
              />
            </>
          }
        />
      </LayoutApp>
      
      {/* Create new / edit existing instrument */}
      <Modal
        footer={
          <>
            <Button onClick={() => updateAddEditModalVisibility(false)} variant="secondary">
              Cancel
            </Button>
            <Button formId="capital-structure-instruments-add-edit" isSubmit={true} variant="primary">
              Save details
            </Button>
          </>
        }
        header={<Heading variant={4} weight={600}>{addEditModalMode === "add" ? "New instrument" : "Edit instrument"}</Heading>}
        onClose={() => updateAddEditModalVisibility(false)}
        position="right"
        visible={addEditModalVisible}
      >
        <Forms.capitalStructure.instruments.addEdit formId="capital-structure-instruments-add-edit" mode={addEditModalMode} {...activeRowData} />
      </Modal>

      {/* Delete existing company director modal */}
      <Modal
        footer={
          <>
            <Button onClick={() => updateDeleteModalVisible(false)} variant="secondary">
              Cancel
            </Button>
            <Button onClick={() => alert(`Delete instrument with ID of: ${deleteInstrumentId}`)} variant="delete">
              Delete
            </Button>
          </>
        }
        header={<Heading variant={4} weight={600}>Delete instrument</Heading>}
        onClose={() => updateDeleteModalVisible(false)}
        position="centre"
        type="delete"
        visible={deleteModalVisible}
      >
        {deleteInstrumentId !== -1 && (
          <span>
            Are you sure you want to delete <strong>{fetchInstrumentById(deleteInstrumentId).name}</strong>
          </span>
        )}
      </Modal>

      {/* View existing instrument */}
      <Modal
        footer={
          <Button onClick={() => updateViewModalVisibility(false)} variant="primary">
            Close
          </Button>
        }
        header={<Heading variant={4} weight={600}>Instrument details</Heading>}
        onClose={() => updateViewModalVisibility(false)}
        position="centre"
        visible={viewModalVisible}
      >
        <Forms.capitalStructure.instruments.view {...activeRowData} formId="instruments-view" mode="view" />
      </Modal>

      {/* Grid filters modal */}
      <Modal
        footer={
          <>
            <Button onClick={() => updateGridFiltersModalVisible(false)} variant="primary">
              Close
            </Button>
          </>
        }
        header={
          <Heading variant={4} weight={600}>
            Grid filters
          </Heading>
        }
        onClose={() => updateGridFiltersModalVisible(false)}
        position="right"
        visible={gridFiltersModal}
      >
        <Tabs
          active={activeFiltersTab}
          items={[
            {
              label: "Filters",
              content: <GridFilters agGridRef={agGridRef} disabled={!agGridLoaded} ref={gridFiltersRef} />
            },
            {
              label: "Columns",
              content: <GridColumnVisibility agGridRef={agGridRef} disabled={!agGridLoaded} />
            }
          ]}
          theme="default"
        />
      </Modal>
    </>
  );
};

export default Instruments;
