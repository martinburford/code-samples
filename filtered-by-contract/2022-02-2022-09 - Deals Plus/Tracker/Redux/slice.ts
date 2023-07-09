// NPM imports
import { createSlice } from "@reduxjs/toolkit";

// Redux
import { AppState } from "..";

// Type imports
import { TCurrentBreakpoint } from "components/global/layouts/app/types/app.types";

// Types
export interface IState {
  apiCallBeingMade: boolean;
  breakpoint: TCurrentBreakpoint;
  modalVisible: boolean;
  notificationShowing: boolean;
  sidebarVisible: boolean;
}

// Initial state
const initialState: IState = {
  apiCallBeingMade: false,
  breakpoint: "",
  modalVisible: false,
  notificationShowing: false,
  sidebarVisible: false,
};

// Actual Slice
export const globalSlice = createSlice({
  initialState,
  name: "global",
  reducers: {
    // Save the current breakpoint
    setBreakpoint(state, action) {
      return {
        ...state,
        breakpoint: action.payload,
      };
    },
    // Specify when an API call is active
    toggleAPICallBeingMade(state, action) {
      return {
        ...state,
        apiCallBeingMade: action.payload,
      };
    },
    // Store the current visibility of the modal
    toggleModalVisibility(state, action) {
      return {
        ...state,
        modalVisible: action.payload,
      };
    },
    // Store the current visibility of an in-page notification
    toggleNotificationShowing(state, action) {
      return {
        ...state,
        notificationShowing: action.payload,
      };
    },
    // Store the current visibility of the sidebar
    toggleSidebarVisibility(state, action) {
      return {
        ...state,
        sidebarVisible: action.payload,
      };
    },
  },
});

// Actions
export const { setBreakpoint, toggleAPICallBeingMade, toggleModalVisibility, toggleNotificationShowing, toggleSidebarVisibility } = globalSlice.actions;

// Selectors
export const getAPICallBeingMade = ({ global }: AppState) => global.apiCallBeingMade;
export const getBreakpoint = ({ global }: AppState) => global.breakpoint;
export const getGlobalState = ({ global }: AppState) => global;
export const getModalVisible = ({ global }: AppState) => global.modalVisible;
export const getNotificationShowing = ({ global }: AppState) => global.notificationShowing;
export const getSidebarVisible = ({ global }: AppState) => global.sidebarVisible;

export default globalSlice.reducer;
