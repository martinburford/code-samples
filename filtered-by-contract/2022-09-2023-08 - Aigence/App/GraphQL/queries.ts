// Isolated queries
export const qryGetExpenseClaims = `
  expenses {
    claims {
      claims(filter: $filter) {
        created
        id
        items {
          ... on ExpenseItem {
            __typename,
            created
            description
            id
            merchant
            netValue
            receipt {
              id
              large {
                height
                url
                width
              }
              medium {
                height
                url
                width
              }
              small {
                height
                url
                width
              }
              status
            }
            taxPercentage
            totalValue
            type {
              id
              name
            }
          }
          ... on MileageItem {
            __typename,
            created
            description
            distance
            id
            mileageRate
            passengers
            totalValue
            trip
            type {
              id
              name
            }
          }
        }
        notes
        status
        summary {
          totalValue
        }
        updated
      }
    }
  }
`;

export const qryGetExpenseImage = `
  image(id: $imageId) {
    id
    large {
      height
      url
      width
    }
    medium {
      height
      url
      width
    }
    small {
      height
      url
      width
    }
    status,
  }
`;

export const qryGetExpenseImageUploadUrl = `
  images {
    getUploadUrl(filename: $filename) {
      id
      url
    }
  }
`;

export const qryGetExpensesSummary = `
  leave {
    currentEntitlement {
      type {
        name
      }
      taken
    }
  }
`;
