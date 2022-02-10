import React from "react";
import ReactDOM from "react-dom";
import Intercom from "react-intercom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { applyMiddleware, combineReducers, createStore } from "redux";
import thunk from "redux-thunk";

// Components
import App from "../app";

// Configuration
import { intercomConfig } from "../configuration";

// Redux
import globalReducer from "../../store/global/reducer";
import profileReducer from "../../store/profile/reducer";
import registrationReducer from "../../store/registration/reducer";
import signinReducer from "../../store/signin/reducer";

const rootReducer = combineReducers({
  global: globalReducer,
  profile: profileReducer,
  registration: registrationReducer,
  signin: signinReducer
});

export const store = createStore(rootReducer, applyMiddleware(thunk));

ReactDOM.hydrate(
  <Provider store={store}>
    <>
      <Intercom
        appID={intercomConfig.appId}
        custom_launcher_selector="[data-launch-intercom]"
        hide_default_launcher={true}
      />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </>
  </Provider>,
  document.getElementById("root")
);
