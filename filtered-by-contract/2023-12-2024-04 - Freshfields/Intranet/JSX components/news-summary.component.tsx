// Components
import Carousel from "components/molecules/carousel";
import EqualizedHeights from "components/atoms/equalized-heights";
import Heading from "components/atoms/heading";
import HeadingWithArrowLink from "components/organisms/heading-with-arrow-link";
import Icon from "components/atoms/icon";
import IconList from "components/molecules/icon-list";
import ImageCardList from "components/webparts/image-card-list";
import NotificationNumber from "components/atoms/notification-number";
import Row from "components/atoms/row";
import WithStyles from "components/webparts/hoc/styles";

// NPM imports
import classnames from "classnames/bind";
import React from "react";
import Skeleton from "react-loading-skeleton";

// Scripts
import { buildDataAttributes } from "scripts/utilities";

// Styles
import styles from "./news-summary.module.scss";

// Types
import { INewsSummary } from "./types/news-summary.types";
import { ESizes } from "types/enums";

export const NewsSummary: React.FC<INewsSummary> = ({
  arrowLink,
  background = "none",
  carousel,
  className,
  dataAttributes = {},
  heading,
  loading = false,
  news,
  notifications,
  stretchToFit = false,
}) => {
  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = classnames.bind(styles);
  let classes = cx({
    "news-summary": true,
  });

  // Do custom utility classes need to be added?
  if (className) classes += ` ${className}`;

  // De-structuring
  const {
    calendar: { number: calendarNumber, text: calendarText, url: calendarUrl },
    chatsHad: { text: chatsHadText, url: chatsHadUrl },
    video: { number: videoNumber, text: videoText, url: videoUrl },
  } = notifications;

  return (
    <WithStyles>
      <div className={classes} {...buildDataAttributes("news-summary", dataAttributes)}>
        <Row background={background} stretchToFit={stretchToFit}>
          <HeadingWithArrowLink
            arrowLink={arrowLink}
            className="mb-20"
            heading={
              <Heading variant={4} weight={500}>
                {heading}
              </Heading>
            }
          />
          <div className={styles.outer}>
            <div className={styles.news}>
              <div className={styles.carousel} data-carousel>
                {loading ? <Skeleton height={175} /> : <Carousel slides={carousel.slides} />}
              </div>
              <div className={styles["news-items"]} data-news-items>
                <EqualizedHeights
                  columnGap={0}
                  columnPadding={ESizes.XS}
                  equalizeByRow={true}
                  itemsPerRow={{ mobile: 1, tablet: 1, desktop: 3 }}
                  rowGap={0}
                >
                  <ImageCardList
                    direction="horizontal"
                    items={news.items.slice(0, 1)}
                    loading={loading}
                    loadingTotal={1}
                    stretchToFit={true}
                  />
                  <ImageCardList
                    direction="horizontal"
                    items={news.items.slice(1, 2)}
                    loading={loading}
                    loadingTotal={1}
                    stretchToFit={true}
                  />
                  <ImageCardList
                    direction="horizontal"
                    items={news.items.slice(2, 3)}
                    loading={loading}
                    loadingTotal={1}
                    stretchToFit={true}
                  />
                  <ImageCardList
                    direction="horizontal"
                    items={news.items.slice(3, 4)}
                    loading={loading}
                    loadingTotal={1}
                    stretchToFit={true}
                  />
                  <ImageCardList
                    direction="horizontal"
                    items={news.items.slice(4, 5)}
                    loading={loading}
                    loadingTotal={1}
                    stretchToFit={true}
                  />
                  <ImageCardList
                    direction="horizontal"
                    items={news.items.slice(5, 6)}
                    loading={loading}
                    loadingTotal={1}
                    stretchToFit={true}
                  />
                  <ImageCardList
                    direction="horizontal"
                    items={news.items.slice(6, 7)}
                    loading={loading}
                    loadingTotal={1}
                    stretchToFit={true}
                  />
                  <ImageCardList
                    direction="horizontal"
                    items={news.items.slice(7, 8)}
                    loading={loading}
                    loadingTotal={1}
                    stretchToFit={true}
                  />
                  <ImageCardList
                    direction="horizontal"
                    items={news.items.slice(8, 9)}
                    loading={loading}
                    loadingTotal={1}
                    stretchToFit={true}
                  />
                </EqualizedHeights>
              </div>
            </div>
            <div className={styles.icons}>
              <EqualizedHeights
                columnGap={0}
                columnPadding={ESizes.XS}
                equalizeByRow={true}
                itemsPerRow={{ mobile: 1, tablet: 1, desktop: 3 }}
                rowGap={0}
                showSeparatorLines={true}
              >
                <div>
                  {loading ? (
                    <Skeleton />
                  ) : (
                    <IconList
                      iconSize={ESizes.S}
                      items={[
                        {
                          icon: <Icon id="vivaEngage" />,
                          text: <a href={chatsHadUrl}>{chatsHadText}</a>,
                        },
                      ]}
                    />
                  )}
                </div>
                <div>
                  {loading ? (
                    <Skeleton />
                  ) : (
                    <NotificationNumber number={videoNumber} numberAlignment="centre">
                      <IconList
                        iconSize={ESizes.S}
                        items={[
                          {
                            icon: <Icon id="videoColoured" />,
                            text: <a href={videoUrl}>{videoText}</a>,
                          },
                        ]}
                      />
                    </NotificationNumber>
                  )}
                </div>
                <div>
                  {loading ? (
                    <Skeleton />
                  ) : (
                    <NotificationNumber number={calendarNumber} numberAlignment="centre">
                      <IconList
                        iconSize={ESizes.S}
                        items={[
                          {
                            icon: <Icon id="calendarColoured" />,
                            text: <a href={calendarUrl}>{calendarText}</a>,
                          },
                        ]}
                      />
                    </NotificationNumber>
                  )}
                </div>
              </EqualizedHeights>
            </div>
          </div>
        </Row>
      </div>
    </WithStyles>
  );
};

export default NewsSummary;
