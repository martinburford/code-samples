// Components
import Card from "components/atoms/card";

// NPM imports
import shuffle from "lodash.shuffle";

// Scripts
import { buildDataAttributes } from "scripts/utilities";

// Styles
import styles from "./tag-cloud.module.scss";

// Types
import { ITagCloud, TCreateTags } from "./types/tag-cloud.types";

export const TagCloud: React.FC<ITagCloud> = ({ dataAttributes = {} }) => {
  // Generate a random number, so that a different strength is applied to each tag on render / re-render
  const randomNumber = () => Math.floor(Math.random() * 5) + 1;

  // Create the tag items, each time with different random strenghts (sizes)
  const data = [
    { label: "proved to be invaluable", strength: randomNumber() },
    { label: "exceptional to collaborate with", strength: randomNumber() },
    { label: "profound knowledge", strength: randomNumber() },
    { label: "a collaborative powerhouse", strength: randomNumber() },
    { label: "his work was exceptional", strength: randomNumber() },
    { label: "strong work ethic", strength: randomNumber() },
    { label: "clarity of vision", strength: randomNumber() },
    { label: "ability to solve problems", strength: randomNumber() },
    { label: "excellent communication skills", strength: randomNumber() },
    { label: "very personable", strength: randomNumber() },
    { label: "highly organised developer", strength: randomNumber() },
    { label: "really well documented", strength: randomNumber() },
    { label: "attention to detail is second to none", strength: randomNumber() },
    { label: "the epitome of professionalism", strength: randomNumber() },
    { label: "extensive knowledge of front-end development", strength: randomNumber() },
    { label: "exceeded our client expectations", strength: randomNumber() },
    { label: "a remarkable attention to detail", strength: randomNumber() },
    { label: "unstoppable source of passion", strength: randomNumber() },
    { label: "an expert in JavaScript", strength: randomNumber() },
    { label: "simply exceptional in every way", strength: randomNumber() },

  ];

  // Create each individual tag for the cloud, with each having styling applied on demand
  const createTags: TCreateTags = (tags) => {
    return shuffle(tags).map((tag, index) => {
      const { label, strength } = tag;

      return (
        <span className={styles[`tag-strength-${strength}`]} data-top={strength === 5} key={index}>
          {label}
        </span>
      );
    });
  };

  return (
    <div className={styles["tag-cloud"]} {...buildDataAttributes("tag-cloud", dataAttributes)}>
      <Card>{createTags(data)}</Card>
    </div>
  );
};

export default TagCloud;
