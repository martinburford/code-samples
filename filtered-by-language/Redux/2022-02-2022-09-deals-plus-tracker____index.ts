// NPM imports
import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";

// Redux
import { companySlice } from "./company/slice";
import { globalSlice } from "./global/slice";

export const store = configureStore({
  reducer: {
    [companySlice.name]: companySlice.reducer,
    [globalSlice.name]: globalSlice.reducer,
  },
})

const makeStore = () => store;

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore["getState"]>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;

export const wrapper = createWrapper<AppStore>(makeStore);