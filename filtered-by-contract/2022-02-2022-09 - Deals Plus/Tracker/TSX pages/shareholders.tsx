// Components
import Breadcrumb from "components/atoms/breadcrumb";
import Button from "components/atoms/button";
import ContentBlockToInline from "components/atoms/content-block-to-inline";
import FlexStretch from "components/widgets/flex-stretch";
import Grid from "components/global/grid";
import GridColumnVisibility from "components/molecules/grid-column-visibility";
import GridFilterButtons from "components/molecules/grid-filter-buttons";
import GridFilters from "components/molecules/grid-filters";
import GridFiltersSummary from "components/widgets/grid-filters-summary";
import Heading from "components/atoms/heading";
import HeadingWithButtons from "components/molecules/heading-with-buttons";
import Icon from "components/atoms/icon";
import LayoutApp from "components/global/layouts/app";
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
import { getShareholders } from "scripts/axios/services/shareholders";
import { AG_GRID_EDIT_BUTTON_AND_ICON_SETTINGS, AG_GRID_ICON_SETTINGS, AG_GRID_OPTIONS, AG_GRID_KEBAB_SETTINGS, AG_GRID_RESIZE_DEBOUNCE, DEFAULT_COLUMN_DEFINITIONS } from "scripts/consts";
import { capitalize } from "scripts/utilities";
import { onGridSizeChanged, registerAGGridLicence } from "scripts/utilities/ag-grid";
import { renderCountry, renderDocuments, renderGridIcon, renderLink } from "scripts/utilities/ag-grid/index-react";
import PopupCellRenderer from "scripts/utilities/ag-grid/popup-cell-renderer";

// Types
import { ESizes } from "types/enums";
import { IColDef } from "types/interfaces";
import { TDeleteShareholderById, TFetchShareholderById, TEditShareholder, TViewShareholder, IShareholder } from "types/pages/shareholders/index.types";

// Register AG Grid so that enterprise features can be used without watermarking
registerAGGridLicence();

const Shareholders: NextPage = () => {
  // Hooks (effects)
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await getShareholders();

      // Save the raw row data in local component state
      updateRowData(data);
    };

    fetchData();
  }, []);

  // Hooks (refs)
  const agGridRef = useRef<AgGridReact>();
  const gridFiltersRef = useRef(null);

  // Hooks (selectors)
  const apiCallBeingMade = useSelector(getAPICallBeingMade);

  // Hooks (state)
  const [activeFiltersTab, updateActiveFiltersTab] = useState(1);
  const [activeRowData, updateActiveRowData] = useState<IShareholder | {}>({});
  const [addEditModalMode, updateAddEditModalMode] = useState<"add" | "edit">("add");
  const [addEditModalVisible, updateAddEditModalVisibility] = useState(false);
  const [agGridLoaded, updateAgGridLoaded] = useState(false);
  const [chartModalVisible, updateChartModalVisibility] = useState(false);
  const [deleteModalVisible, updateDeleteModalVisible] = useState(false);
  const [deleteShareholderId, updateDeleteShareholderId] = useState(-1);
  const [gridFiltersModal, updateGridFiltersModalVisible] = useState(false);
  const [rowData, updateRowData] = useState<IShareholder[] | null>(null);
  const [viewModalVisible, updateViewModalVisible] = useState(false);

  // Define the columsn for the data grid
  const columnDefinitions: IColDef[] = [
    {
      ...AG_GRID_EDIT_BUTTON_AND_ICON_SETTINGS,
      ...AG_GRID_ICON_SETTINGS,
      cellRenderer: useCallback((params) => renderGridIcon(params), []),
      cellRendererParams: {
        // Show the delete modal, passing the unique record id for lookup purposes
        callback: (data) => {
          deleteShareholderById(data.id);
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
          editShareholder(data);
        },
        iconId: "edit",
      },
    },
    {
      ...AG_GRID_EDIT_BUTTON_AND_ICON_SETTINGS,
      ...AG_GRID_ICON_SETTINGS,
      cellRenderer: useCallback((params) => renderGridIcon(params), []),
      cellRendererParams: {
        // The the moment, just show an alert, with the id for the selected record
        callback: (data) => {
          // data includes the data for the row selected (if that becomes a requirement)
          updateChartModalVisibility(true);
        },
        iconId: "pieChartSplit",
      },
      tooltipField: "instruments",
    },
    {
      cellRenderer: useCallback((params) => renderLink(params), []),
      cellRendererParams: {
        // Show the view Shareholder details modal
        callback: (data) => {
          viewShareholder(data);
        },
        dataKeyName: "name",
        keyPrefix: "name-",
        linkPrefix: "/shareholders",
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
      cellRenderer: useCallback((params) => renderCountry(params.data.country), []),
      externalFilter: "list",
      field: "country",
      filter: "agSetColumnFilter",
      headerName: "Country",
    },
    {
      externalFilter: "text",
      field: "taxReferenceNumber",
      filter: "agTextColumnFilter",
      headerName: "Tax reference number",
    },
    {
      ...AG_GRID_KEBAB_SETTINGS,
      cellRenderer: PopupCellRenderer,
    },
  ];

  // Column definitions for Chart modal
  const chartModalColumnDefinitions: IColDef[] = [
    {
      field: "event",
      headerName: "Event",
    },
    {
      field: "date",
      headerName: "Date",
    },
    {
      field: "investment",
      headerName: "Investment",
    },
    {
      field: "price",
      headerName: "Price",
    },
    {
      cellClass: "cell-centre",
      cellRenderer: useCallback((params) => renderDocuments(params), []),
      cellRendererParams: {
        // Show the documents modal
        callback: (data) => {
          const documents = data.documents.map(document => {
            return `${document.path} (${document.filesize})`;
          })
          alert(`Documents for the selected record:
****
${documents.join("\n")}`);
        },
      },
      field: "documents",
      filter: false,
      headerClass: "cell-centre",
      headerName: "Documents",
    },
  ];

  // Show the modal to delete a specific shareholder
  const deleteShareholderById: TDeleteShareholderById = (id) => {
    updateDeleteShareholderId(id);
    updateDeleteModalVisible(true);
  };

  // Pre-populate all Modal form fields with the correct data
  const editShareholder: TEditShareholder = (row) => {
    updateActiveRowData(row);
    updateAddEditModalMode("edit");
    updateAddEditModalVisibility(true);
  };

  // Grab the data for a shareholder (matched against a unique shareholder id)
  const fetchShareholderById: TFetchShareholderById = (id) => {
    return rowData.find((shareholder) => shareholder.id === id);
  };

  // View a specific shareholders details
  const viewShareholder: TViewShareholder = (row) => {
    updateActiveRowData(row);
    updateViewModalVisible(true);
  };

  return (
    <>
      <Head>
        <title>Shareholders</title>
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
              <Breadcrumb items={[{ label: "Deal name", url: "#" }, { label: "Shareholders" }]} />
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
                      updateActiveRowData({});

                      updateAddEditModalMode("add");
                      updateAddEditModalVisibility(true);
                    }}
                    prefixIcon={<Icon id="plusInCircle" />}
                    variant="primary"
                  >
                    Add shareholder
                  </Button>,
                ]}
                heading={<Heading variant={1}>Shareholders</Heading>}
              />
              <ContentBlockToInline gap={ESizes.M} inlineElementsFrom="tabletPortrait">
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
              </ContentBlockToInline>
              <GridFiltersSummary />
            </>
          }
        />
      </LayoutApp>

      {/* Create new / edit existing shareholder */}
      <Modal
        footer={
          <>
            <Button onClick={() => updateAddEditModalVisibility(false)} variant="secondary">
              Cancel
            </Button>
            <Button formId="shareholders-add-edit" isSubmit={true} variant="primary">
              Save details
            </Button>
          </>
        }
        header={
          <Heading variant={4} weight={600}>
            {addEditModalMode === "add" ? "New shareholder" : "Edit shareholder"}
          </Heading>
        }
        onClose={() => updateAddEditModalVisibility(false)}
        position="right"
        visible={addEditModalVisible}
      >
        <Forms.shareholders.addEdit formId="shareholders-add-edit" mode={addEditModalMode} {...activeRowData} />
      </Modal>

      {/* Delete existing shareholder modal */}
      <Modal
        footer={
          <>
            <Button onClick={() => updateDeleteModalVisible(false)} variant="secondary">
              Cancel
            </Button>
            <Button onClick={() => alert(`Delete shareholder with ID of: ${deleteShareholderId}`)} variant="delete">
              Delete
            </Button>
          </>
        }
        header={
          <Heading variant={4} weight={600}>
            Delete shareholder
          </Heading>
        }
        onClose={() => updateDeleteModalVisible(false)}
        position="centre"
        type="delete"
        visible={deleteModalVisible}
      >
        {deleteShareholderId !== -1 && (
          <span>
            Are you sure you want to delete <strong>{fetchShareholderById(deleteShareholderId).name}</strong>
          </span>
        )}
      </Modal>

      {/* View existing shareholder */}
      <Modal
        footer={
          <Button onClick={() => updateViewModalVisible(false)} variant="primary">
            Close
          </Button>
        }
        header={
          <Heading variant={4} weight={600}>
            Shareholder details
          </Heading>
        }
        onClose={() => updateViewModalVisible(false)}
        position="centre"
        visible={viewModalVisible}
      >
        <Forms.shareholders.view {...activeRowData} formId="shareholders-view" mode="view" />
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
              content: <GridFilters agGridRef={agGridRef} disabled={!agGridLoaded} ref={gridFiltersRef} />,
            },
            {
              label: "Columns",
              content: <GridColumnVisibility agGridRef={agGridRef} disabled={!agGridLoaded} />,
            },
          ]}
          theme="default"
        />
      </Modal>

      {/* Chart modal */}
      <Modal
        footer={
          <>
            <Button onClick={() => updateChartModalVisibility(false)} variant="primary">
              Close
            </Button>
          </>
        }
        header={
          <Heading variant={4} weight={600}>
            Chart modal
          </Heading>
        }
        onClose={() => updateChartModalVisibility(false)}
        position="centre"
        visible={chartModalVisible}
      >
        <Grid.Row>
          <Grid.Col mobile={{ span: 12 }} tabletPortrait={{ span: 6 }}>
            <Select
              fullWidth={true}
              id="chart-modal-company-type"
              items={[
                {
                  text: "Company type 1",
                  value: "company-type-1",
                },
                {
                  text: "Company type 2",
                  value: "company-type-2",
                },
                {
                  text: "Company type 3",
                  value: "company-type-3",
                },
              ]}
              label="Company type"
              placeholder="Please select"
            />
          </Grid.Col>
          <Grid.Col mobile={{ span: 12 }} tabletPortrait={{ span: 6 }}>
            <Select
              fullWidth={true}
              id="chart-modal-share-type"
              items={[
                {
                  text: "Share type 1",
                  value: "share-type-1",
                },
                {
                  text: "Share type 2",
                  value: "share-type-2",
                },
                {
                  text: "Share type 3",
                  value: "share-type-3",
                },
              ]}
              label="Share type"
              placeholder="Please select"
            />
          </Grid.Col>
        </Grid.Row>
        <div style={{ height: "160px" }}>
          <AgGridReact
            {...AG_GRID_OPTIONS}
            columnDefs={useMemo(() => chartModalColumnDefinitions, [])}
            defaultColDef={useMemo(() => {
              return {
                ...DEFAULT_COLUMN_DEFINITIONS,
                flex: 1
              };
            }, [])}
            rowData={[
              {
                event: "Event 1",
                date: "01/01/2020",
                investment: "£1,000,000",
                price: "£100",
                documents: [
                  { filesize: `100kb`, path: `path-to-file/file1.pdf` }
                ]
              },
              {
                event: "Event 2",
                date: "02/01/2020",
                investment: "£2,000,000",
                price: "£200",
                documents: [
                  { filesize: `100kb`, path: `path-to-file/file1.pdf` },
                  { filesize: `200kb`, path: `path-to-file/file2.pdf` }
                ]
              },
              {
                event: "Event 3",
                date: "03/01/2020",
                investment: "£3,000,000",
                price: "£300",
                documents: [
                  { filesize: `100kb`, path: `path-to-file/file1.pdf` },
                  { filesize: `200kb`, path: `path-to-file/file2.pdf` },
                  { filesize: `300kb`, path: `path-to-file/file3.pdf` }
                ]
              },
            ]}
          />
        </div>
      </Modal>
    </>
  );
};

export default Shareholders;
