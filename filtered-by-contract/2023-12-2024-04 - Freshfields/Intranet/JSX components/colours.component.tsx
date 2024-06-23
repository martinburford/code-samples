// Components
import BulletList from "components/atoms/bullet-list";
import Card from "components/atoms/card";
import Divider from "components/atoms/divider";
import Grid from "components/atoms/grid";
import Heading from "components/atoms/heading";

// NPM imports
import React from "react";

// Scripts
// import { capitalize } from "scripts/utilities";
import { buildDataAttributes } from "scripts/utilities";

// Styles
import styles from "./colours.module.scss";

// Types
import { IColour } from "./types/colours.types";
import { EColours } from "types/enums";
import { IDynamicObject } from "types/interfaces";

const Colour: React.FC<IColour> = ({ background, dataAttributes = {}, group, introduction, isLast }) => {
  // Find the matching enums for the group provided
  const groupColours: IDynamicObject = Object.fromEntries(
    Object.entries(EColours).filter(([key]) => {
      return key.startsWith(group.toUpperCase());
    })
  );

  return (
    <Card
      {...buildDataAttributes("summary", dataAttributes)}
      background={background}
      className={!isLast ? "mb-20" : ""}
      header={{
        content: introduction || null,
        title: group,
      }}
    >
      <Grid.Row compact={true}>
        {Object.keys(groupColours).map((key, index) => {
          // A different grid is required for base colours
          const gridColumns = {
            mobile: !key.startsWith("BASE_") ? 3 : 6, // 4x per row || 2x per row
            tabletPortrait: !key.startsWith("BASE_") ? 2 : 3, // 6x per row || 4x per row
            desktop: !key.startsWith("BASE_") ? 1 : 2, // 12x per row || 6x per row
          };

          return groupColours[key].split("-")[1] || key.includes("_") ? (
            <Grid.Col
              compact={true}
              key={index}
              mobile={{ span: gridColumns.mobile }}
              tabletPortrait={{ span: gridColumns.tabletPortrait }}
              desktop={{ span: gridColumns.desktop }}
            >
              <strong className={styles.variant}>
                {!groupColours[key].includes("base")
                  ? groupColours[key].split("-").slice(1).join("-")
                  : `$${groupColours[key]}`}
              </strong>
              <div className={styles.colour} data-colour={groupColours[key]}>
                <span className={styles.hex} />
                <div className={styles.block} />
              </div>
            </Grid.Col>
          ) : null;
        })}
      </Grid.Row>
    </Card>
  );
};

export const Colours: React.FC = () => {
  return (
    <div className={styles.colours}>
      <Colour
        background={EColours.BASE_WHITE}
        group="base"
        introduction={
          <>
            <p>
              ALL colours available in the site are either a <strong>base</strong> colour OR a variant derived from a
              base colour. There are 12x base colours:
            </p>
            <Grid.Row>
              <Grid.Col span={6}>
                <BulletList
                  bulletType="chevron"
                  heading={<Heading variant={6} weight={600}>6x of these offer variants</Heading>}
                  items={[
                    <><code>$base-blue-mid</code> =&gt; <code>$blue</code></>,
                    <><code>$base-gray</code> =&gt; <code>$gray</code></>,
                    <><code>$base-green</code> =&gt; <code>$green</code></>,
                    <><code>$base-salmon</code> =&gt; <code>$salmon</code></>,
                    <><code>$base-violet</code> =&gt; <code>$violet</code></>,
                    <><code>$base-yellow</code> =&gt; <code>$yellow</code></>
                  ]}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <BulletList
                    bulletType="chevron"
                    heading={<Heading variant={6} weight={600}>6x do not</Heading>}
                    items={[
                      <><code>$base-black</code></>,
                      <><code>$base-blue-dark</code></>,
                      <><code>$base-blue-light</code></>,
                      <><code>$base-red</code></>,
                      <><code>$base-success</code></>,
                      <><code>$base-white</code></>
                    ]}
                  />
              </Grid.Col>
            </Grid.Row>
            <br />
            <Divider variant="gradient" />
            <br />
            <p>
              For the 6x that do, all offer 5x lighter shade variants and 5x darker shade variants. In these cases, the
              base variant of each colour is set to be the middle of the 11x shades (<code>400</code>) that each colour
              has available.
            </p>
            <p>For the 6x that do not, these base colours are available in the that single colour alone.</p>
            <span>To reference any base colours, Sass variables in the form as shown below should be used:</span>
          </>
        }
      />
      <Colour
        background={EColours.BASE_BLUE_DARK}
        group="blue"
        introduction={
          <>
            Despite there being 3x separate blue base colours, only the <code>blue-dark</code> offers 11x shade
            variants. The <code>400</code> variant matches the <code>base-blue-mid</code> colour. To reference any blue
            colours, Sass variables in the form of <code>$blue-xxx</code> should be used (as per the values below):
          </>
        }
      />
      <Colour
        background={EColours.BASE_GRAY}
        group="gray"
        introduction={
          <>
            The <code>400</code> variant matches the <code>base-gray</code> colour. To reference any gray colours, Sass
            variables in the form of <code>$gray-xxx</code> should be used (as per the values below):
          </>
        }
      />
      <Colour
        background={EColours.BASE_GREEN}
        group="green"
        introduction={
          <>
            The <code>400</code> variant matches the <code>base-green</code> colour. To reference any green colours,
            Sass variables in the form of <code>$green-xxx</code> should be used (as per the values below):
          </>
        }
      />
      <Colour
        background={EColours.BASE_SALMON}
        group="salmon"
        introduction={
          <>
            The <code>400</code> variant matches the <code>base-salmon</code> colour. To reference any salmon colours,
            Sass variables in the form of <code>$salmon-xxx</code> should be used (as per the values below):
          </>
        }
      />
      <Colour
        background={EColours.BASE_VIOLET}
        group="violet"
        introduction={
          <>
            The <code>400</code> variant matches the <code>base-violet</code> colour. To reference any violet colours,
            Sass variables in the form of <code>$violet-xxx</code> should be used (as per the values below):
          </>
        }
      />
      <Colour
        background={EColours.BASE_YELLOW}
        group="yellow"
        introduction={
          <>
            The <code>400</code> variant matches the <code>base-yellow</code> colour. To reference any yellow colours,
            Sass variables in the form of <code>$yellow-xxx</code> should be used (as per the values below):
          </>
        }
        isLast={true}
      />
    </div>
  );
};

export default Colours;
