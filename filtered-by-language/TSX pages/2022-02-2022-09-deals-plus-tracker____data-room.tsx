// Components
import Breadcrumb from "components/atoms/breadcrumb";
import Button from "components/atoms/button";
import Checkbox from "components/atoms/checkbox";
import ContentBlockToInline from "components/atoms/content-block-to-inline";
import ContentJustified from "components/atoms/content-justified";
import DataRoom from "components/widgets/data-room";
import DatePicker from "components/molecules/date-picker";
import Divider from "components/atoms/divider";
import FlexStretch from "components/widgets/flex-stretch";
import GridColumnVisibility from "components/molecules/grid-column-visibility";
import GridFilterButtons from "components/molecules/grid-filter-buttons";
import GridFilters from "components/molecules/grid-filters";
import GridFiltersSummary from "components/widgets/grid-filters-summary";
import Heading from "components/atoms/heading";
import HeadingWithButtons from "components/molecules/heading-with-buttons";
import Icon from "components/atoms/icon";
import IconList from "components/molecules/icon-list";
import LayoutApp from "components/global/layouts/app";
import Modal from "components/atoms/modal";
import Tabs from "components/atoms/tabs";
import Textfield from "components/atoms/textfield";

// Forms
import Forms from "forms";

// NPM imports
import { AgGridReact } from "ag-grid-react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRef, useState } from "react";

// Scripts
import { resolveFileExtensionToIconId } from "scripts/utilities";

// Types
import { EColours, ESizes } from "types/enums";

const DataRoomPage: NextPage = () => {
  // Hooks (refs)
  const agGridRef = useRef<AgGridReact>();
  const gridFiltersRef = useRef(null);

  // Hooks (state)
  const [activeFiltersTab, updateActiveFiltersTab] = useState(1);
  const [agGridLoaded, updateAgGridLoaded] = useState(false);
  const [deleteFiles, updateDeleteFiles] = useState([]);
  const [deleteModalVisible, updateDeleteModalVisible] = useState(false);
  const [gridFiltersModal, updateGridFiltersModalVisible] = useState(false);
  const [uploadFileModalVisible, updateUploadFileModalVisibility] = useState(false);

  const onAgGridLoaded = () => {
    updateAgGridLoaded(true);
  };

  return (
    <>
      <Head>
        <title>Document Management</title>
      </Head>
      <LayoutApp stretchGridToFit={true}>
        <FlexStretch
          content={
            <DataRoom
              agGridRef={agGridRef}
              onAgGridLoaded={onAgGridLoaded}
              onDeleteFiles={(files) => {
                updateDeleteFiles(files);
                console.log("files", files)
                updateDeleteModalVisible(true);
              }}
            />
          }
          dataAttributes={{ "data-component-spacing": "0" }}
          header={
            <>
              <Breadcrumb items={[{ label: "Deal name", url: "#" }, { label: "Data room" }]} />
              <HeadingWithButtons
                buttons={[
                  <Button key="button-1" prefixIcon={<Icon id="plusInCircle" />} variant="secondary">
                    Add new folder
                  </Button>,
                  <Button key="button-2" onClick={() => updateUploadFileModalVisibility(true)} prefixIcon={<Icon id="upload" />} variant="primary">
                    Upload file
                  </Button>,
                ]}
                heading={<Heading variant={1}>Data room</Heading>}
              />
              <ContentBlockToInline gap={ESizes.M} inlineElementsFrom="tabletPortrait">
                <Textfield name="data-room-search" placeholder="Search" prefix={<Icon colour={EColours.GRAY} id="search" size={ESizes.XS} />} />
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
            </>
          }
          showBorder={false}
        />
      </LayoutApp>

      {/* Delete files */}
      <Modal
        footer={
        <ContentJustified
          extendedSlot="slot2"
          slot1={
            <Checkbox 
              label="Don't show again"
              name="dont-show-again" 
              value={1}
            />
          }
          slot2={
            <>
              <Button onClick={() => updateDeleteModalVisible(false)} variant="secondary">
                Cancel
              </Button>
              <Button onClick={() => alert("Delete files")} variant="delete">
                Delete
              </Button>
            </>
          }
        />
        }
        header={
          <Heading variant={4} weight={600}>
            <>Delete {deleteFiles.length === 1 ? "file" : "multiple files"}</>
          </Heading>
        }
        onClose={() => updateDeleteModalVisible(false)}
        position="centre"
        type="delete"
        visible={deleteModalVisible}
      >
        <span>Are you sure you want to delete the <strong>{deleteFiles.length}</strong> selected {deleteFiles.length === 1 ? "file" : "files"}?</span>
        <br /><br />
        <Divider colour={EColours.ERROR} />
        <IconList
          dataAttributes={{ "data-component-spacing": "0" }}
          items={deleteFiles.map(file => {
            const { fileExtension, title } = file;

            return {
              icon: <Icon id={resolveFileExtensionToIconId(fileExtension)} />,
              text: title,
            }
          })}
        />
      </Modal>

      {/* Upload a new file */}
      <Modal
        footer={
          <>
            <Button onClick={() => updateUploadFileModalVisibility(false)} variant="secondary">
              Cancel
            </Button>
            <Button formId="data-room-upload-file" isSubmit={true} variant="primary">
              Upload file
            </Button>
          </>
        }
        header={
          <Heading variant={4} weight={600}>
            Upload file
          </Heading>
        }
        onClose={() => updateUploadFileModalVisibility(false)}
        position="right"
        visible={uploadFileModalVisible}
      >
        <Forms.dataRoom.uploadFile formId="data-room-upload-file" mode="add" />
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
    </>
  );
};

export default DataRoomPage;
