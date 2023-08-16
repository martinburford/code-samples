// Components
import Button from "@aigence/components/atoms/button";
import Icon from "@aigence/components/atoms/icon";

// NPM imports
import { cssTransition, toast } from "react-toastify";

// Redux
import { store } from "@aigence/store";
import { toggleNotificationShowing } from "@aigence/store/global/slice";

// Scripts
import { buttonThemeFromActionType } from "@aigence/scripts/utilities";

// Types
import { EActionTypes, EColours, ESizes } from "@aigence/types/enums";
import { IDynamicObject } from "@aigence/types/interfaces";
import { EOnboardStatus } from "@aigence/types/page/onboard-employee/index.types";
import { TRenderActionType, TShowPageNotification } from "./types/index-react.types";

// TBC ...
export const renderActionType: TRenderActionType = (actionType, callback, options) => {
  switch (actionType) {
    case EActionTypes.APPROVE:
    case EActionTypes.ARCHIVE:
    case EActionTypes.CANCEL_REQUEST:
    case EActionTypes.CHANGE_OPTIONS:
    case EActionTypes.COMPLETE:
    case EActionTypes.DELETE:
    case EActionTypes.QUICK_APPROVE:
    case EActionTypes.QUICK_SUBMIT:
    case EActionTypes.RECALL:
    case EActionTypes.REJECT:
    case EActionTypes.REVIEW_AND_RUN:
    case EActionTypes.SUBMIT: {
      // Construct a button, as all of these options require a button with a performable action
      const { label: buttonLabel, theme: buttonType } = buttonThemeFromActionType(actionType);

      const buttonOptions: IDynamicObject = {};
      if (options?.formId) {
        buttonOptions.isSubmit = true;
        buttonOptions.formId = options.formId;
      }

      if (callback) {
        buttonOptions.onClick = () => callback();
      }

      return (
        <Button compact={true} variant={buttonType} {...buttonOptions}>
          {buttonLabel}
        </Button>
      );
    }

    // If none of the above, the action type should be provided as "none", since nothing is needing to be done
    case EActionTypes.NONE:
      return <span>No action required</span>;
  }
};

// Render a status icon and supplementary status type of count of outstanding tasks?
export const renderStatus = (status: EOnboardStatus | string[]): React.ReactElement => {
  let statusIconElem = null;
  let statusText = null;

  switch (status) {
    case EOnboardStatus.COMPLETED:
      statusIconElem = <Icon colour={EColours.GREEN} id="tickCircle" size={ESizes.S} />;
      statusText = <span className="green">Completed</span>;
      break;
    case EOnboardStatus.DECLINED:
      statusIconElem = <Icon colour={EColours.RED} id="closeCircle" size={ESizes.S} />;
      statusText = <span className="red">Declined</span>;
      break;
    default:
      statusIconElem = <Icon colour={EColours.WARNING} id="warningTriangle" size={ESizes.S} />;
      statusText = (
        <span className="warning">
          {status.length} {status.length > 1 ? "tasks" : "task"} to complete
        </span>
      );
      break;
  }

  return (
    <div className="align-center flex">
      <div data-margin-right="xxs">{statusIconElem}</div>
      {statusText}
    </div>
  );
};

// Generate a page notification (via react-toastify)
export const showPageNotification: TShowPageNotification = (message, type) => {
  // Which prefix icon should be used?
  let iconId;
  switch (type) {
    case "error":
      iconId = "exclamationCircle";
      break;
    case "info":
      iconId = "informationCircle";
      break;
    case "success":
      iconId = "tickCircle";
      break;
    case "warning":
      iconId = "warningTriangle";
      break;
  }

  // Setup a custom "in" and "out" transition
  const customTransition = cssTransition({
    enter: "bounce-in-top",
    exit: "slide-out-top",
  });

  store.dispatch(toggleNotificationShowing(true));

  return toast(message, {
    closeButton: <Icon colour={EColours.WHITE} dataAttributes={{ "data-component-spacing": "0" }} eventStopPropagation={false} id="closeCircle" size={ESizes.S} />,
    hideProgressBar: true,
    icon: <Icon colour={EColours.WHITE} dataAttributes={{ "data-component-spacing": "0" }} id={iconId} size={ESizes.M} />,
    onClose: () => store.dispatch(toggleNotificationShowing(false)),
    position: "top-center",
    theme: "colored",
    transition: customTransition,
    type,
  });
};
