// Components
import Button from "@aigence/components/atoms/button";
import Checkbox from "@aigence/components/atoms/checkbox";
import DataTable, { centered, convertDate, currentStatus, plainText, toggleSuffixRow } from "@aigence/components/widgets/data-table";
import GenerateSuffixRow from "@aigence/components/widgets/generate-suffix-row";
import Icon from "@aigence/components/atoms/icon";

// Forms
import Forms from "forms";

// NPM imports
import { useMutation } from "@apollo/client";
import { useEffect, useRef, useState } from "react";

// Scripts
import { deleteLeaveRequestsGQL } from "@aigence/scripts/apollo/services/leave";
import { DATA_TABLE_COLUMN_WIDTHS } from "@aigence/scripts/consts";
import { updateCheckboxListSelectedItems } from "@aigence/scripts/utilities";
import { showPageNotification } from "@aigence/scripts/utilities/index-react";

// Types
import { ECategory, ESizes } from "@aigence/types/enums";
import { IDataTableLeave, TGenerateFormattedData } from "@aigence/types/page/leave/index.types";

const Leave: React.FC<IDataTableLeave> = ({ onComplete, rawData }) => {
  // Hooks (effects)
  useEffect(() => {
    if (rawData.length > 0) {
      // Convert the table data to the right format
      const formattedData = generateFormattedData(rawData);
      updateFormattedData(formattedData);
    }
  }, [rawData]);

  // Hooks (GraphQL)
  const [deleteLeaveRequests] = useMutation(deleteLeaveRequestsGQL);

  // Hooks (refs)
  // Use a ref vs state for monitoring which items to delete, so that a re-render isn't triggered
  const toDeleteRef = useRef<number[]>([]);

  // Hooks (state)
  const [formattedData, updateFormattedData] = useState([]);

  // Convert the raw data to formatted data, in order to present it within the <DataTable>
  const generateFormattedData: TGenerateFormattedData = (data) => {
    return data.map((row) => {
      const { actionedBy, actionedDate, actionerNotes, dayDuration, duration, id, requesterNotes, startDate, status, type, updated } = row;

      const durationSuffix = duration === 1 ? "day" : "days";

      return {
        data: [
          {
            formatted: (
              <div className="flex">
                <Checkbox
                  label="Delete"
                  name={`checkbox-${id}`}
                  onChange={(event) => (toDeleteRef.current = updateCheckboxListSelectedItems(event.target.checked, toDeleteRef.current, id) as number[])}
                  value={1}
                />
                <Icon expandedHitArea={ESizes.XXS} eventStopPropagation={false} id="arrowRight" size={ESizes.XXS} />
              </div>
            ),
          },
          centered(id),
          plainText(type.name),
          convertDate(startDate),
          centered(`${duration} ${durationSuffix}`),
          convertDate(updated, true),
          plainText(!requesterNotes ? `[${dayDuration}]: None provided` : `[${dayDuration}]: ${requesterNotes.substring(0, 1000)}...`),
          currentStatus(status),
        ],
        onToggle: (e) => toggleSuffixRow(e),
        suffixRow: (
          <GenerateSuffixRow
            // Settings
            formId={`leave-add-edit-${id}`}
            FormType={Forms.leave.addEdit}
            mode="edit"
            onComplete={onComplete}
            rowId={id}
            withSeparator={true}
            // Form data
            actionedBy={actionedBy}
            actionedDate={actionedDate}
            actionerNotes={actionerNotes}
            dayDuration={dayDuration}
            duration={duration}
            requesterNotes={requesterNotes}
            startDate={startDate}
            status={status}
            type={type}
          />
        ),
      };
    });
  };

  // Send a list of requests to GraphQL, for permanent deletion
  const deleteRequests = () => {
    const ids = toDeleteRef.current;

    // If there's no items selected for deletion
    if (ids.length === 0) {
      showPageNotification("There are no items selected for deletion", "error");
      return;
    }

    deleteLeaveRequests({
      onCompleted: () => {
        // Refetch the leave requests, in order to refresh the data table entries
        onComplete();

        // Show an in-page notification, alerting the user to the deletion of one (or many) requests
        const notificationText =
          ids.length > 1
            ? `Leave ${ids.length > 1 ? "requests" : "request"}: ${ids.join(",")} deleted`
            : `Success! Your request for ${rawData.find((request) => request.id === ids[0]).type.name} has been deleted`;
        showPageNotification(notificationText, "success");

        // Once the notification has shown, reset the refs storing the selected rows
        toDeleteRef.current = [];
      },
      variables: { ids },
    });
  };

  return (
    <>
      <Button compact={true} onClick={() => deleteRequests()} variant="primary">
        <>Delete selected items</>
      </Button>
      <DataTable
        category={ECategory.LEAVE}
        hasHoverRowBackground={true}
        hasLeftEdge={true}
        headings={[
          { text: "", width: 100 },
          { align: "center", text: "Id", width: DATA_TABLE_COLUMN_WIDTHS.id },
          { text: "Type", width: DATA_TABLE_COLUMN_WIDTHS.leaveType },
          { text: "Starts", width: DATA_TABLE_COLUMN_WIDTHS.startDate },
          { align: "center", text: "Duration", width: DATA_TABLE_COLUMN_WIDTHS.daysDuration },
          { text: "Last updated", width: DATA_TABLE_COLUMN_WIDTHS.lastUpdated },
          { text: "Notes" },
          { text: "Status", width: DATA_TABLE_COLUMN_WIDTHS.status },
        ]}
        loading={formattedData.length === 0}
        loadingRows={10}
        rows={formattedData}
        theme="stroke"
      />
    </>
  );
};

export default Leave;
