// NPM imports
import axios from "axios";

// Redux
import { store } from "store";
import { toggleAPICallBeingMade } from "store/global/slice";

const axiosClient = axios.create({
  baseURL: "/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Place a pause in the execution of ALL Axios responses
const sleep = (ms = 1): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Add a request interceptor
axiosClient.interceptors.request.use(function (config) {
  // Do something before request is sent

  // Data fetching is starting
  store.dispatch(toggleAPICallBeingMade(true));

  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

// Add a response interceptor
axiosClient.interceptors.response.use(async (response) => {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data

  // Data fetching is ending
  store.dispatch(toggleAPICallBeingMade(false));
  
  // Wait for a pre-determined amount of time before returning the result
  await sleep(1);

  return response;
}, function (error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  return Promise.reject(error);
});

export {
  axiosClient
}
