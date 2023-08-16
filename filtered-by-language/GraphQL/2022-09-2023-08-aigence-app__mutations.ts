export const mtnCreateExpenseItem = `
  expenses {
    claims {
      update(id: $updateId) {
        expenses {
          create(input: $input) {
            created
          }
        }
      }
    }
  }
`;

export const mtnCreateMileageItem = `
  expenses {
    claims {
      update(id: $updateId) {
        mileage {
          create(input: $input) {
            created
          }
        }
      }
    }
  }
`;

export const mtnDeleteExpenseItem = `
  expenses {
    claims {
      update {
        expenses {
          delete(id: $deleteId) {
            message
            success
          }
        }
      }
    }
  }
`;

export const mtnDeleteMileageItem = `
  expenses {
    claims {
      update {
        mileage {
          delete(id: $deleteId) {
            message
            success
          }
        }
      }
    }
  }
`;

export const mtnSubmitExpensesClaim = `
  expenses {
    claims {
      action(id: $claimId) {
        submit {
          id
          status
        }
      }
    }
  }
`;

export const mtnUpdateExpenseItem = `
  expenses {
    claims {
      update(id: $updateId) {
        expenses {
          update(input: $input) {
            updated
          }
        }
      }
    }
  }
`;

export const mtnUpdateMileageItem = `
  expenses {
    claims {
      update(id: $updateId) {
        mileage {
          update(input: $input) {
            updated
          }
        }
      }
    }
  }
`;
