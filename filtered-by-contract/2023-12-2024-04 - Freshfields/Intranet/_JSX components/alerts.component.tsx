// Components
import AlertsList from "components/organisms/alerts-list";
import CalendarList from "components/atoms/calendar-list";
import Divider from "components/atoms/divider";
import EqualizedHeights from "components/atoms/equalized-heights";
import Heading from "components/atoms/heading";
import MessageList from "components/atoms/message-list";
import Row from "components/atoms/row";
import WithStyles from "components/webparts/hoc/styles";

// NPM imports
import classnames from "classnames/bind";
import React from "react";
import Skeleton from "react-loading-skeleton";

// Scripts
import { buildDataAttributes } from "scripts/utilities";

// Styles
import styles from "./alerts.module.scss";

// Types
import { IAlerts } from "./types/alerts.types";
import { ESizes } from "types/enums";

export const Alerts: React.FC<IAlerts> = ({
  alerts,
  background = "none",
  calendarList,
  className,
  dataAttributes = {},
  heading,
  keyEmails,
  keyTeamsChats,
  loading = false,
  stretchToFit = false,
  tasks,
}) => {
  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = classnames.bind(styles);
  let classes = cx({
    alerts: true,
  });

  // Do custom utility classes need to be added?
  if (className) classes += ` ${className}`;

  // De-structuring
  // Alerts
  const { heading: alertsHeading, items: alertsItems } = alerts;

  // CalendarList
  const { heading: calendarListHeading, items: calendarListItems } = calendarList;

  // Key Emails
  const {
    borderColour: keyEmailsBorderColour,
    heading: keyEmailsHeading,
    items: keyEmailsItems,
    showReadStatus: keyEmailsShowReadStatus,
  } = keyEmails;

  // Key Teams Chats
  const {
    borderColour: keyTeamsChatsBorderColour,
    heading: keyTeamsChatsHeading,
    items: keyTeamsChatsItems,
  } = keyTeamsChats;

  // Taks
  const { heading: tasksHeading, items: tasksItems } = tasks;

  // JSX block for loading (tasks and alerts) lists
  const loadingLists = (
    <>
      <Skeleton height={40} />
      <Divider className="mt-10" variant="solid" />
      <Skeleton count={4} />
    </>
  );

  return (
    <WithStyles>
      <div className={classes} {...buildDataAttributes("alerts", dataAttributes)}>
        <Row background={background} stretchToFit={stretchToFit}>
          <Heading variant={4} weight={500}>
            {heading}
          </Heading>
          <EqualizedHeights
            columnGap={0}
            columnPadding={ESizes.XS}
            equalizeByRow={true}
            itemsPerRow={{ mobile: 1, tablet: 1, desktop: 3 }}
            rowGap={0}
            showSeparatorLines={true}
          >
            {loading ? (
              <div>
                <Skeleton height={40} />
                <Divider className="mt-10" variant="solid" />
                <Skeleton count={2} />
                <Divider className="mt-10" variant="solid" />
                <Skeleton count={2} />
                <Divider className="mt-10" variant="solid" />
                <Skeleton count={2} />
                <Divider className="mt-10" variant="solid" />
                <Skeleton count={2} />
              </div>
            ) : (
              <MessageList
                borderColour={keyEmailsBorderColour}
                heading={keyEmailsHeading}
                items={keyEmailsItems}
                showReadStatus={keyEmailsShowReadStatus}
              />
            )}
            {loading ? (
              <div>
                <Skeleton height={40} />
                <Divider className="mt-10" variant="solid" />
                <Skeleton count={12} />
              </div>
            ) : (
              <CalendarList heading={calendarListHeading} items={calendarListItems} />
            )}
            <div className={styles["vertical-split"]}>
              <EqualizedHeights itemsPerRow={{ mobile: 1, tablet: 1, desktop: 2 }} rowGap={0} showSeparatorLines={true}>
                {loading ? <div>{loadingLists}</div> : <AlertsList heading={tasksHeading} items={tasksItems} />}
                {loading ? (
                  <div>{loadingLists}</div>
                ) : (
                  <AlertsList heading={alertsHeading} items={alertsItems} showIcons={true} />
                )}
              </EqualizedHeights>
              {loading ? (
                <div>
                  <Skeleton height={40} />
                  <Divider className="mt-10" variant="solid" />
                  <Skeleton count={2} />
                  <Divider className="mt-10" variant="solid" />
                  <Skeleton count={2} />
                </div>
              ) : (
                <MessageList
                  borderColour={keyTeamsChatsBorderColour}
                  heading={keyTeamsChatsHeading}
                  items={keyTeamsChatsItems}
                />
              )}
            </div>
          </EqualizedHeights>
        </Row>
      </div>
    </WithStyles>
  );
};

export default Alerts;
