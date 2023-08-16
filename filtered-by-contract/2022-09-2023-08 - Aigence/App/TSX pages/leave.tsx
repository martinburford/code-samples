// Components
import EqualizedHeights from "@aigence/components/atoms/equalized-heights";
import Grid from "@aigence/components/global/grid";
import LayoutApp from "components/global/layouts/app";
import Statistic from "@aigence/components/molecules/statistic";
import ToggleBlock from "@aigence/components/widgets/toggle-block";

// Data tables
import DataTables from "data-tables";

// Forms
import Forms from "forms";

// NPM imports
import { useLazyQuery } from "@apollo/client";
import type { NextPage } from "next";
import Head from "next/head";
import React, { useEffect, useRef } from "react";

// Scripts
import { getLeaveRequestsGQL, getLeaveSummaryGQL } from "@aigence/scripts/apollo/services/leave";

// Types
import { ECategory } from "@aigence/types/enums";

const Leave: NextPage = () => {
  // Hooks (GraphQL)
  // Fetch data for the Employee leave summary
  const [
    leaveSummaryLazy,
    {
      data: summaryData = {
        employee: [
          {
            leave: {
              currentEntitlement: [
                {
                  taken: 0,
                },
                {
                  taken: 0,
                },
                {
                  taken: 0,
                },
              ],
            },
          },
        ],
      },
      error: summaryError,
      loading: summaryLoading,
    },
  ] = useLazyQuery(getLeaveSummaryGQL);

  // Fetch data for the Employee leave data table
  const [
    getLeaveRequestsLazy,
    {
      data: requestsData = {
        employee: [
          {
            leave: {
              leaveRequests: [],
            },
          },
        ],
      },
      error: requestsError,
      refetch: requestsRefetch,
    },
  ] = useLazyQuery(getLeaveRequestsGQL);

  // Hooks (effects)
  useEffect(() => {
    // Fetch the summary data for the top of the page (3x Statistics)
    leaveSummaryLazy();

    // Retrieve the latest set of leave requests from GraphQL
    getLeaveRequestsLazy();
  }, []);

  // Hooks (refs)
  const toggleBlockRef = useRef<HTMLDivElement>(null);

  // De-structuring
  const [annualLeave, sickLeave, unpaidLeave] = summaryData.employee[0].leave.currentEntitlement;
  const {
    leave: { leaveRequests },
  } = requestsData.employee[0];

  return (
    <>
      <Head>
        <title>Leave</title>
      </Head>
      <LayoutApp pageTitle="Leave" apiErrors={[summaryError, requestsError]}>
        <Grid.Row>
          <Grid.Col mobile={{ span: 12 }} desktop={{ offset: 2, span: 8 }}>
            <EqualizedHeights
              backgroundColour={ECategory.LEAVE}
              equalizeByRow={true}
              itemsPerRow={{
                mobile: 1,
                tablet: 2,
                desktop: 3,
              }}
            >
              <Statistic
                dataAttributes={{ "data-component-spacing": "0" }}
                heading="Annual leave"
                layout="centered"
                loading={summaryLoading}
                statistics={[
                  {
                    number: annualLeave.taken,
                    text: "days available",
                  },
                ]}
              />
              <Statistic
                dataAttributes={{ "data-component-spacing": "0" }}
                heading="Personal"
                layout="centered"
                loading={summaryLoading}
                statistics={[
                  {
                    number: sickLeave.taken,
                    text: "days taken",
                  },
                ]}
              />
              <Statistic
                dataAttributes={{ "data-component-spacing": "0" }}
                heading="Unpaid leave"
                layout="centered"
                loading={summaryLoading}
                statistics={[
                  {
                    number: unpaidLeave.taken,
                    text: "days taken",
                  },
                ]}
              />
            </EqualizedHeights>
          </Grid.Col>
        </Grid.Row>
        <ToggleBlock
          borderColour={ECategory.LEAVE}
          content={
            <Forms.leave.addEdit
              formId="leave-add-edit"
              mode="add"
              onComplete={() => {
                // Close the expandable header once a new request has successfully been created
                toggleBlockRef.current.click();

                requestsRefetch();
              }}
              rowId={0}
            />
          }
          header="New leave request"
          ref={toggleBlockRef}
          theme="stroke"
        />
        <DataTables.leave onComplete={requestsRefetch} rawData={leaveRequests} />
      </LayoutApp>
    </>
  );
};

export default Leave;
