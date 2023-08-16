// Components
import Divider from "@aigence/components/atoms/divider";
import EmployeeCard from "@aigence/components/widgets/employee-card";
import Heading from "@aigence/components/atoms/heading";
import Icon from "@aigence/components/atoms/icon";
import IconList from "@aigence/components/molecules/icon-list";
import LayoutApp from "components/global/layouts/app";
import Link from "@aigence/components/atoms/link";
import Tabs from "@aigence/components/atoms/tabs";

// Data Tables
import DataTables from "data-tables";

// Forms
import Forms from "forms";

// NPM imports
import { useLazyQuery } from "@apollo/client";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";

// Scripts
import { getPayslipsGQL } from "@aigence/scripts/apollo/services/employee";
import { getBenefits } from "@aigence/scripts/axios/services/benefits";
import { getDocuments, getInformation, getSalary, getSummary } from "@aigence/scripts/axios/services/employee";
import { getTimesheetsForManager } from "@aigence/scripts/axios/services/timesheets";
import { features } from "@aigence/scripts/configuration";
import { DATA_TABLE_COLUMN_WIDTHS } from "@aigence/scripts/consts";

// Types
import { IEmployeeCard } from "@aigence/components/widgets/employee-card/types/employee-card.types";
import { EColours, ESizes } from "@aigence/types/enums";
import { IBenefit } from "@aigence/types/page/benefits/index.types";
import { IEmployeeDocuments, IEmployeeSalary, IFormsData, IFullProfile } from "@aigence/types/page/directory/user/index.types";
import { ITimesheet } from "@aigence/types/page/timesheets/index.types";
import PayslipsBreakdown from "@aigence/components/widgets/payslips-breakdown/payslips-breakdown.component";

const UserProfile: NextPage = () => {
  // Hooks (GraphQL)
  // Fetch data for Payslips
  const [
    getPayslipsLazy,
    {
      data: payslipsData = {
        employee: [
          {
            payslips: [
              {
                deductions: [
                  {
                    calculations: [],
                    totalValue: 0,
                    type: "",
                  },
                ],
                endDate: "2023-06-06",
                income: [],
                summary: {
                  grossIncome: 1,
                  netIncome: 2,
                  totalDeductions: 3,
                },
              },
            ],
          },
        ],
      },
      loading: payslipsLoading,
    },
  ] = useLazyQuery(getPayslipsGQL);

  // Hooks (NextJS)
  const router = useRouter();
  const { id: employeeId } = router.query;

  // Hooks (effects)
  useEffect(() => {
    if (!employeeId) return;

    // Fetch the data for ALL 5x tabs at once
    const fetchData = async () => {
      return [
        await getSummary(Number(employeeId)),
        await getInformation(Number(employeeId)),
        await getBenefits(Number(employeeId)),
        await getSalary(Number(employeeId)),
        await getDocuments(Number(employeeId)),
        await getTimesheetsForManager(Number(employeeId)),
      ];
    };

    fetchData().then((data) => {
      const [summary, information, benefits, salary, documents, timesheets] = data;

      updateLoading(false);
      updateFormsData({
        information: information.data as IFullProfile,
        benefits: benefits.data as IBenefit[],
        salary: salary.data as IEmployeeSalary,
        summary: summary.data as IEmployeeCard,
        documents: documents.data as IEmployeeDocuments,
        timesheets: timesheets.data as ITimesheet[],
      });
    });

    // Fetch data for Payslips
    getPayslipsLazy();
  }, [employeeId]);

  // Hooks (state)
  const [formsData, updateFormsData] = useState<IFormsData>({
    benefits: [],
    documents: {},
    information: {},
    salary: {
      pendingSalaryRises: [],
      salaryHistory: [],
    },
    summary: {
      contactCard: {
        department: "",
        email: "",
        firstName: "",
        jobTitle: "",
        lastName: "",
        location: {
          name: "",
        },
        phoneNumber: "",
      },
      id: "",
      reportsTo: {
        firstName: "",
        lastName: "",
        role: "",
      },
      salary: {
        amount: 0,
        lastReviewed: "1900-01-01",
      },
      startDate: "1900-01-01",
    },
    timesheets: [],
  });
  const [loading, updateLoading] = useState(true);

  // De-structuring
  const {
    contactCard: { department, email, firstName, jobTitle, lastName, location, phoneNumber },
    id,
    reportsTo: { firstName: reportsToFirstName, lastName: reportsToLastName, role: reportsToRole },
    salary: { amount: salaryAmount, lastReviewed: salaryLastReviewed },
    startDate,
  } = formsData.summary;
  const { payslips } = payslipsData.employee[0];

  return (
    <>
      <Head>
        <title>User profile</title>
      </Head>
      <LayoutApp pageTitle={`User profile: ${employeeId}`}>
        <IconList
          items={[
            {
              icon: <Icon colour={EColours.CORAL} id="arrowLeft" />,
              text: <Link href="/directory">back to search</Link>,
            },
          ]}
          size={ESizes.XS}
        />
        <EmployeeCard
          contactCard={{
            department,
            email,
            firstName,
            jobTitle: (
              <Heading dataAttributes={{ "data-component-spacing": "xs" }} variant={5}>
                {jobTitle}
              </Heading>
            ),
            lastName,
            location,
            phoneNumber,
          }}
          id={id}
          loading={loading}
          reportsTo={{
            firstName: reportsToFirstName,
            lastName: reportsToLastName,
            role: reportsToRole,
          }}
          salary={{
            amount: salaryAmount,
            lastReviewed: salaryLastReviewed,
          }}
          startDate={startDate}
        />
        <Divider />
        <Tabs
          active={1}
          disabled={loading}
          items={[
            {
              label: {
                text: "Employee Info",
              },
              content: <Forms.directory.user.employeeInformationEdit formId="userProfileEdit" loading={loading} {...formsData.information} />,
              tabId: "employee-information",
            },
            {
              label: {
                text: "Salary",
              },
              content: (
                <>
                  <Forms.directory.user.salaryEdit
                    formId="salaryEdit"
                    loading={loading}
                    onPendingSalaryRiseUpdate={(data) => {
                      const currentPendingSalaryRises = (formsData.salary as IEmployeeSalary).pendingSalaryRises;

                      updateFormsData({
                        ...formsData,
                        salary: {
                          ...formsData.salary,
                          pendingSalaryRises: [data, ...currentPendingSalaryRises],
                        },
                      });
                    }}
                    {...formsData.salary}
                  />
                  <br />
                  <Divider />

                  {/* Pending Salary Rises */}
                  <Heading variant={5} weight={500}>
                    Pending Salary Rises
                  </Heading>
                  {loading ? (
                    <p>
                      <Skeleton />
                    </p>
                  ) : (
                    <DataTables.directory.user.salary.pendingSalaryRises rawData={(formsData.salary as IEmployeeSalary).pendingSalaryRises} />
                  )}

                  {/* Salary History */}
                  <Heading variant={5} weight={500}>
                    Salary History
                  </Heading>
                  {loading ? (
                    <p>
                      <Skeleton />
                    </p>
                  ) : (
                    <DataTables.directory.user.salary.salaryHistory rawData={(formsData.salary as IEmployeeSalary).salaryHistory} />
                  )}
                </>
              ),
              tabId: "salary",
            },
            {
              label: {
                text: "Benefits",
              },
              content: <>{loading ? <Skeleton /> : <DataTables.benefits rawData={formsData.benefits} />}</>,
              tabId: "benefits",
            },
            {
              label: {
                text: "Documents",
              },
              content: <>{loading ? <Skeleton /> : <DataTables.directory.user.documents rawData={formsData.documents as IEmployeeDocuments} />}</>,
              tabId: "documents",
            },
            {
              label: {
                text: "Timesheets",
              },
              content: (
                <>
                  {loading ? (
                    <Skeleton />
                  ) : (
                    <DataTables.timesheets
                      columnHeaders={[
                        { align: "center", text: "Id", width: DATA_TABLE_COLUMN_WIDTHS.id },
                        { text: "Period" },
                        { text: "Status", width: DATA_TABLE_COLUMN_WIDTHS.status },
                        { text: "Last updated", width: DATA_TABLE_COLUMN_WIDTHS.lastUpdated },
                        { text: "Action", width: DATA_TABLE_COLUMN_WIDTHS.actionType },
                      ]}
                      rawData={formsData.timesheets}
                      viewMode="manager"
                    />
                  )}
                </>
              ),
              hidden: !features.timesheets,
              tabId: "timesheets",
            },
          ]}
          theme="stroke"
        />
      </LayoutApp>
    </>
  );
};

export default UserProfile;
