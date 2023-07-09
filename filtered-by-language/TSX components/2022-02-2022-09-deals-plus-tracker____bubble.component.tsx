// NPM imports
import classnames from "classnames/bind";

// Scripts
import { buildDataAttributes } from "scripts/utilities";

// Styles
import styles from "./bubble.module.scss";

// Types
import { EColours } from "types/enums";
import { IBubble } from "./types/bubble.types";

export const Bubble: React.FC<IBubble> = ({
  children,
  colour = EColours.PRIMARY,
  dataAttributes = {},
  prefixIcon,
  suffixIcon
}) => {
  // Bind classnames to the components CSS module object in order to access its modular styles
  const cx = classnames.bind(styles);
  const classes = cx({
    "bubble": true,
    [colour]: true,
  });

  // Should prefix and suffix icons by added to the bubble?
  const prefixIconElem = prefixIcon ? <div className={styles["prefix-icon"]}>{prefixIcon}</div> : null;
  const suffixIconElem = suffixIcon ? <div className={styles["suffix-icon"]}>{suffixIcon}</div> : null;

  return (
    <div
      className={classes}
      {...buildDataAttributes("bubble", dataAttributes)}
    >
      {prefixIconElem}
      <span className={styles.content}>{children}</span>
      {suffixIconElem}
    </div>
  );
};

export default Bubble;
