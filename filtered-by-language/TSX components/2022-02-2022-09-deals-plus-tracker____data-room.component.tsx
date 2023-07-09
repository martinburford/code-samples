// Components
import BulletList from "components/atoms/bullet-list";
import Button from "components/atoms/button";
import Card from "components/atoms/card";
import ContentJustified from "components/atoms/content-justified";
import Divider from "components/atoms/divider";
import Heading from "components/atoms/heading";
import Icon from "components/atoms/icon";
import IconList from "components/molecules/icon-list";
import Modal from "components/atoms/modal";
import Treeview from "components/molecules/treeview";

// NPM imports
import "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import debounce from "lodash.debounce";
import React, { useCallback, useMemo, useState } from "react";

// Scripts
import { AG_GRID_KEBAB_SETTINGS, AG_GRID_OPTIONS, AG_GRID_RESIZE_DEBOUNCE, DEFAULT_COLUMN_DEFINITIONS } from "scripts/consts";
import { buildDataAttributes, resolveFileExtensionToIconId } from "scripts/utilities";
import { dateComparator, onGridSizeChanged, registerAGGridLicence } from "scripts/utilities/ag-grid";
import { renderGridFilenameWithIcon } from "scripts/utilities/ag-grid/index-react";
import PopupCellRenderer from "scripts/utilities/ag-grid/popup-cell-renderer";

// Styles
import styles from "./data-room.module.scss";

// Types
import { IDataRoom } from "./types/data-room.types";
import { ESizes } from "types/enums";
import { IColDef } from "types/interfaces";

// Register AG Grid so that enterprise features can be used without watermarking
registerAGGridLicence();

export const DataRoom: React.FC<IDataRoom> = ({ agGridRef, dataAttributes = {}, onAgGridLoaded, onDeleteFiles }) => {
  // Hooks (state)
  const [activeFolder, updateActiveFolder] = useState("No folder selected");
  const [activePath, updateActivePath] = useState("");
  const [moveFilesModalVisible, updateMoveFilesModalVisibility] = useState(false);
  const [rowData, updateRowData] = useState([]);
  const [selectedFiles, updateSelectedFiles] = useState([]);
  const [toPath, updateToPath] = useState("");

  // Define the columns for the data grid
  const columnDefinitions: IColDef[] = [
    {
      cellRenderer: useCallback((params) => renderGridFilenameWithIcon(params), []),
      checkboxSelection: true,
      externalFilter: "text",
      field: "title",
      filter: "agTextColumnFilter",
      headerCheckboxSelection: true,
      headerName: "File name",
    },
    {
      externalFilter: "text",
      field: "company",
      filter: "agTextColumnFilter",
      headerName: "Company",
    },
    {
      externalFilter: "datepicker",
      field: "date",
      filter: "agDateColumnFilter",
      filterParams: { comparator: dateComparator },
      headerName: "Date",
    },
    {
      externalFilter: "datepicker",
      field: "documentPeriod",
      filter: "agDateColumnFilter",
      filterParams: { comparator: dateComparator },
      headerName: "Document period",
    },
    {
      ...AG_GRID_KEBAB_SETTINGS,
      cellRenderer: PopupCellRenderer,
    },
  ];

  return (
    <div className={styles["data-room"]} {...buildDataAttributes("data-room", dataAttributes)}>
      <div className={styles.outer}>
        <div className={styles.treeview}>
          <Card
            header={
              <Heading variant={5} weight={600}>
                Deal name: xxx
              </Heading>
            }
          >
            <Treeview
              apiUrl="/other/dynamic-treeview"
              data={[
                {
                  icon: <Icon id="folderFilled" />,
                  key: "1-0",
                  path: "path/1-0",
                  title: (
                    <span>
                      Folder 1<em></em>
                    </span>
                  ),
                },
              ]}
              draggable={true}
              dynamicDataLoading={true}
              onExpand={(expanded, node, treeData) => {
                // Perform functionality based on the selection of a tree node
                const { children = [], key, path, title } = node;

                // Store the path of the active node, as this will be required within the modal for moving folders
                updateActivePath(path);

                // Provided a node is expanded AND it has children, save the children (the documents) to state for the document viewer
                if (expanded && children.length > 0) {
                  // Store the selected title
                  updateActiveFolder(title);

                  const rowData = children.map((row) => {
                    const { company, date, documentPeriod, fileExtension, title } = row;

                    return {
                      company,
                      date,
                      documentPeriod,
                      fileExtension,
                      title,
                    };
                  });

                  updateRowData(rowData);
                }
              }}
              showFiles={false}
              switcherIconContracted={<Icon id="arrowRight" size={ESizes.XXS} />}
              switcherIconExpanded={<Icon id="arrowDown" size={ESizes.XXS} />}
              toggleFiles={true}
            />
          </Card>
        </div>
        <div className={styles["document-viewer"]}>
          <div className={styles["document-viewer-inner"]}>
            <Card
              header={
                <>
                  <ContentJustified
                    extendedSlot="slot1"
                    slot1={
                      <>
                        <Heading variant={5} weight={600}>
                          {activeFolder}
                        </Heading>
                        <span className={styles["items-selected"]}>
                          {selectedFiles.length} {selectedFiles.length === 1 ? "item" : "items"} selected
                        </span>
                      </>
                    }
                    slot2={
                      <div className="flex">
                        <Icon
                          dataAttributes={{ "data-margin-right": ESizes.XS }}
                          disabled={selectedFiles.length === 0}
                          expandedHitArea={ESizes.XS}
                          id="move"
                          onClick={() => updateMoveFilesModalVisibility(true)}
                          size={ESizes.XS}
                        />
                        <Icon disabled={selectedFiles.length === 0} expandedHitArea={ESizes.XS} id="bin" onClick={() => onDeleteFiles(agGridRef.current.api.getSelectedRows())} size={ESizes.XS} />
                      </div>
                    }
                    verticalAlignment="center"
                  />
                </>
              }
            >
              <AgGridReact
                {...AG_GRID_OPTIONS}
                columnDefs={useMemo(() => columnDefinitions, [])}
                defaultColDef={useMemo(() => DEFAULT_COLUMN_DEFINITIONS, [])}
                onDisplayedColumnsChanged={debounce(
                  useCallback(() => onGridSizeChanged({ agGridRef }), []),
                  AG_GRID_RESIZE_DEBOUNCE
                )}
                onFirstDataRendered={() => onAgGridLoaded()}
                onGridSizeChanged={debounce(
                  useCallback(() => onGridSizeChanged({ agGridRef }), []),
                  AG_GRID_RESIZE_DEBOUNCE
                )}
                onSelectionChanged={() => {
                  updateSelectedFiles(agGridRef.current.api.getSelectedRows());
                }}
                ref={agGridRef}
                rowData={rowData}
                rowSelection={"multiple"}
              />
            </Card>
          </div>
        </div>
      </div>
      {/* Move file(s) */}
      <Modal
        footer={
          <>
            <Button onClick={() => updateMoveFilesModalVisibility(false)} variant="secondary">
              Cancel
            </Button>
            <Button
              disabled={activePath === "" || toPath === "" || selectedFiles.length === 0}
              onClick={() => {
                alert(`Save data
****
From: ${activePath}
To: ${toPath}
****
Files: 
${selectedFiles.map(file => file.title).join("\n")}
`);
              }}
              variant="primary"
            >
              Save details
            </Button>
          </>
        }
        header={<Heading variant={4}>Move files</Heading>}
        onClose={() => updateMoveFilesModalVisibility(false)}
        position="right"
        visible={moveFilesModalVisible}
      >
        <BulletList
          items={[
            {
              text: (
                <>
                  <strong>From: </strong>
                  {activePath}
                </>
              ),
            },
            {
              text: (
                <>
                  <strong>To: </strong>
                  {toPath}
                </>
              ),
            },
          ]}
        />
        <Heading dataAttributes={{ "data-component-spacing": "xs" }} variant={5} weight={500}>
          Selected file(s)
        </Heading>
        <IconList
          items={selectedFiles.map((file) => {
            return {
              icon: <Icon id={resolveFileExtensionToIconId(file.fileExtension)} />,
              text: file.title,
            };
          })}
          size={ESizes.XS}
        />
        <Divider />
        <Treeview
          apiUrl="/other/dynamic-treeview"
          data={[
            {
              icon: <Icon id="folderFilled" />,
              key: "1-0",
              path: "path/1-0",
              title: (
                <span>
                  Folder 1<em></em>
                </span>
              ),
            },
          ]}
          dynamicDataLoading={true}
          onExpand={(expanded, node, treeData) => {
            // Perform functionality based on the selection of a tree node
            const { path } = node;

            // Store a reference to the folder files are being requested to be moved to
            updateToPath(path);
          }}
          switcherIconContracted={<Icon id="arrowRight" size={ESizes.XXS} />}
          switcherIconExpanded={<Icon id="arrowDown" size={ESizes.XXS} />}
        />
      </Modal>
    </div>
  );
};

export default DataRoom;
