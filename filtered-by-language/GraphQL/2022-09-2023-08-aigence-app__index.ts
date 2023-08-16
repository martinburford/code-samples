// NPM imports
import gql from "graphql-tag";

// Isolated mutations
import {
  mtnCreateExpenseItem,
  mtnCreateMileageItem,
  mtnDeleteExpenseItem,
  mtnDeleteMileageItem,
  mtnSubmitExpensesClaim,
  mtnUpdateExpenseItem,
  mtnUpdateMileageItem,
} from "./mutations";

// Isolated queries
import { qryGetExpenseClaims, qryGetExpenseImage, qryGetExpenseImageUploadUrl, qryGetExpensesSummary } from "./queries";

// Mutations
const createExpenseItemGQL = gql`
  mutation createExpenseItem($input: ExpenseItemCreateInput!, $updateId: Int) {
    ${mtnCreateExpenseItem}
  }
`;

const createMileageItemGQL = gql`
  mutation createMilageItem($input: MileageItemCreateInput!, $updateId: Int) {
    ${mtnCreateMileageItem}
  }
`;

const deleteExpenseItemGQL = gql`
  mutation deleteExpenseItem($deleteId: Int!) {
    ${mtnDeleteExpenseItem}
  }
`;

const deleteMileageItemGQL = gql`
  mutation deleteMileageItem($deleteId: Int!) {
    ${mtnDeleteMileageItem}
  }
`;

const submitExpenseClaimGQL = gql`
  mutation submitExpenseClaim($claimId: Int!) {
    ${mtnSubmitExpensesClaim}
  }
`;

const updateExpenseItemGQL = gql`
  mutation updateExpenseItem($input: ExpenseItemUpdateInput!, $updateId: Int) {
    ${mtnUpdateExpenseItem}
  }
`;

const updateMileageItemGQL = gql`
  mutation UpdateMileageItem($input: MileageItemUpdateInput!, $updateId: Int) {
    ${mtnUpdateMileageItem}
  }
`;

// Queries
const getExpenseClaimsGQL = gql`
  query getExpenseClaims($filter: ExpenseClaimFilter) {
    ${qryGetExpenseClaims}
  }
`;

const getExpensesSummaryGQL = gql`
  query getExpensesSummary {
    employee {
      ${qryGetExpensesSummary}
    }
  }
`;

const getExpenseImageGQL = gql`
  query getExpenseImage($imageId: String!) {
    ${qryGetExpenseImage}
  }
`;

const getExpenseImageUploadUrlGQL = gql`
  query getExpenseImageUploadUrl($filename: String!) {
    ${qryGetExpenseImageUploadUrl}
  }
`;

export default {
  mutations: {
    createExpenseItem: createExpenseItemGQL,
    createMileageItem: createMileageItemGQL,
    deleteExpenseItem: deleteExpenseItemGQL,
    deleteMileageItem: deleteMileageItemGQL,
    updateExpenseItem: updateExpenseItemGQL,
    updateMileageItem: updateMileageItemGQL,
    submitExpenseClaim: submitExpenseClaimGQL,
  },
  queries: {
    getExpenseClaims: getExpenseClaimsGQL,
    getExpenseImage: getExpenseImageGQL,
    getExpenseImageUploadUrl: getExpenseImageUploadUrlGQL,
    getExpensesSummary: getExpensesSummaryGQL,
  }
}