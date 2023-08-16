// NPM imports
import { AnyAction } from "@reduxjs/toolkit";

// Type imports
import { IDataAttributes } from "@aigence/types/interfaces";

// Interfaces
export interface ILeaveCalendar extends IDataAttributes {
  /** The month that the dates apply for */
  month: number;
  /** Set the view mode */
  setViewMode: (viewType: string) => AnyAction;
  /** Should a 7 day week be shown? */
  showWeekends?: boolean;
  /** The year to fetch data for in respect of the calendars content */
  year: number;
  /** The view mode */
  viewMode: "grid" | "list";
}

// Types
export type TAttachRequestsToDays = (calendarDaysData: TDayData[], leaveData: TLeaveRequest[]) => TDayData[];
export type TBuildDaysList = (month: number, year: number) => TDayData[];
export type TDayData = {
  date: Date;
  isWeekend: boolean;
  name: TDaysOfTheWeek;
  number: number;
  outsideMonth: boolean;
  requests: TLeaveRequest[];
};
export type TDaysOfTheWeek = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
export type TGenerateCleanData = (data: any[]) => TLeaveRequest[];
export type TLeaveRequest = {
  name: string;
  dates: number[][];
};
export type TRefreshData = (month: number, year: number) => Promise<void>;
export type TSeparateLeaveBlocksByGap = (days: number[]) => number[][];
