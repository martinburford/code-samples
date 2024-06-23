// Components
import Button from "components/atoms/button";
import DateAsString from "components/atoms/date-as-string";
import Divider from "components/atoms/divider";
import Row from "components/atoms/row";
import WithStyles from "components/webparts/hoc/styles";

// NPM imports
import classnames from "classnames/bind";
import React from "react";
import Skeleton from "react-loading-skeleton";

// Scripts
import { buildDataAttributes } from "scripts/utilities";

// Styles
import styles from "./image-card-list.module.scss";

// Types
import { IImageCardList, TLoadingImageNewsListItem } from "./types/image-card-list.types";
import { IDynamicObject } from "types/interfaces";

export const ImageCardList: React.FC<IImageCardList> = ({
  background,
  className,
  dataAttributes = {},
  direction = "vertical",
  heading,
  items,
  isFeatured,
  link,
  loading = false,
  loadingTotal,
  stretchToFit = false,
}) => {
  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = classnames.bind(styles);
  let classes = cx({
    "has-link": link,
    horizontal: direction === "horizontal",
    "image-card-list": true,
    "is-featured": isFeatured,
    "is-loading": loading,
    vertical: direction === "vertical",
  });

  // Do custom utility classes need to be added?
  if (className) classes += ` ${className}`;

  // JSX block for loading (both horizontal and vertical) image list item skeletons
  const loadingImageNewsListItem: TLoadingImageNewsListItem = (direction, loadingTotal) => {
    switch (direction) {
      case "horizontal":
        return (
          <div className={styles["loading-horizontal"]}>
            {Array.from({ length: loadingTotal }).map((_, index) => (
              <div className={styles.loading} key={`skeleton-${index}`}>
                <div>
                  <Skeleton height={56} />
                </div>
                <div>
                  <Skeleton count={1.5} />
                </div>
              </div>
            ))}
          </div>
        );
      case "vertical":
        return (
          <>
            {Array.from({ length: loadingTotal }).map((_, index) => (
              <>
                <Skeleton className="mb-10" key={`skeleton-${index}`} height={100} />
                <Skeleton count={2.5} />
                {index < loadingTotal && <Divider className="mb-10 mt-10" variant="solid" />}
              </>
            ))}
          </>
        );
    }
  };

  return (
    <WithStyles>
      <div className={classes} {...buildDataAttributes("image-card-list", dataAttributes)}>
        <Row background={background} stretchToFit={stretchToFit}>
          <>
            {heading && <div className={styles.heading}>{heading}</div>}
            {loading ? (
              loadingImageNewsListItem(direction, loadingTotal || 2)
            ) : (
              <ul className={styles.list}>
                {items.map((item, index) => {
                  const { date, image, isFeatured = false, subText, text, url } = item;
                  const itemAttributes: IDynamicObject = {};

                  // Apply custom data attributes for items which are showing a featured item (within its list)
                  if (isFeatured) {
                    itemAttributes["data-is-featured"] = true;
                    itemAttributes["data-image-alignment"] = image!.alignment || "left";
                  }

                  return (
                    <li key={index} {...itemAttributes}>
                      {image && (
                        <div className={styles.image}>
                          <img alt={image.alt} height={image.height} src={image.src} width={image.width} />
                        </div>
                      )}
                      <div className={styles.content} data-content>
                        {date && <DateAsString date={date} />}
                        <strong>
                          <a className={styles.link} href={url}>
                            {text}
                          </a>
                        </strong>
                        {subText && <span className={styles["sub-text"]}>{subText}</span>}
                      </div>
                    </li>
                  );
                })}
                {link && (
                  <div className={styles.footer}>
                    <Button onClick={() => link.onClick()} variant="primary">
                      {link.text}
                    </Button>
                  </div>
                )}
              </ul>
            )}
          </>
        </Row>
      </div>
    </WithStyles>
  );
};

export default ImageCardList;
