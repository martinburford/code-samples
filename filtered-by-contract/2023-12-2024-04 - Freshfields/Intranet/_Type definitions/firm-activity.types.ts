// NPM imports
import React from "react";

// Type imports
import { TArrowLinkWithoutDefaults } from "components/molecules/arrow-link/types/arrow-link.types";
import { IEventsList } from "components/webparts/events-list/types/events-list.types";

import { IClassName, IDataAttributes, IWebpart } from "types/interfaces";

// Interfaces
export interface IFirmActivity extends IClassName, IDataAttributes, IWebpart {
  conversation: {
    /** The arrowLink for conversations */
    arrowLink: {
      [Property in keyof TArrowLinkWithoutDefaults]: TArrowLinkWithoutDefaults[Property];
    };
    /** The main heading of the conversation portion of the component */
    heading: React.ReactNode;
  };
  events: {
    /** The arrowLink for events */
    arrowLink: {
      [Property in keyof TArrowLinkWithoutDefaults]: TArrowLinkWithoutDefaults[Property];
    };
    /** The main heading of the events portion of the component */
    heading: IEventsList["heading"];
    /** The events themselves */
    items: IEventsList["items"];
  };
}

// Types
// ...
