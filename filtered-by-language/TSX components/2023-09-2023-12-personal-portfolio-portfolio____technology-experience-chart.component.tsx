"use client";

// Context
import ThemeContext from "context/providers/theme";

// NPM imports
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import { colord } from "colord";
import { useCallback, useContext, useLayoutEffect } from "react";

// Scripts
import { AMCHARTS_THEMES, TECHNOLOGY_START_DATES } from "scripts/consts";
import {
  buildDataAttributes,
  getMonthsAndYearsFromDateUntilNow,
  getTechnologyDateDiff,
} from "scripts/utilities";

// Styles
import styles from "./technology-experience-chart.module.scss";

// Types
import { ITechnologyExperienceChart } from "./types/technology-experience-chart.types";

export const TechnologyExperienceChart: React.FC<ITechnologyExperienceChart> = ({ dataAttributes = {} }) => {
  // Hooks (context)
  const { theme } = useContext(ThemeContext);

  // Hooks (effects)
  const themeBarColours = useCallback(
    (coloursToConvert) => {
      return coloursToConvert.map((colour) => am5.color(colour)).reverse();
    },
    [theme]
  );

  // Use a base colour for both "light" and "dark" mode, in order to generate shades
  const colours = [AMCHARTS_THEMES.barChart[theme].bar];

  useLayoutEffect(() => {
    const root = am5.Root.new("technology-experience-chart", {
      useSafeResolution: false, // This ensures on touch devices there is no compression in the quality of fonts and edges within the canvas
    });

    // Derive abstracted theme values, and assign them to the chart
    // The dependency array for useLayoutEffect forces this to be reset whenever the context site-theme changes
    const customThemeObj = am5.Theme.new(root);
    customThemeObj.rule("Grid").setAll({ stroke: am5.color(AMCHARTS_THEMES.barChart[theme].grid) }),
    customThemeObj.rule("Label").setAll({ fill: am5.color(AMCHARTS_THEMES.barChart[theme].label) }),

    root.setThemes([customThemeObj]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        paddingBottom: 0,
        paddingLeft: 0,
        paddingTop: 0,
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
      })
    );

    // How many technologies have been provided?
    const itemsCount = TECHNOLOGY_START_DATES.length;
    const colourStep = 0.4 / itemsCount; // This will ensure the colours only in a range from 40% - 100% of the selected base colour

    // Generate ligher shade colours from a singular base colour (for both "light" and "dark" mode)
    Array.from({ length: itemsCount - 1 }).map(() => {
      colours.push(
        colord(colours[colours.length - 1])
          .lighten(colourStep)
          .toHex()
      );
    });

    // Convert the hex codes into AMCharts-specific colours
    // Then assign them to the chart
    chart.get("colors").set("colors", themeBarColours(colours));

    // Create the axes for the chart
    const yRenderer = am5xy.AxisRendererY.new(root, {
      minGridDistance: 30,
    });

    yRenderer.grid.template.set("location", 1);

    // Y-axis
    const yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "label",
        renderer: yRenderer,
        tooltip: am5.Tooltip.new(root, {
          forceHidden: true, // Hide the cursor tooltip for the yAxis
        }),
      })
    );

    // X-axis
    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, {}),
      })
    );

    // Attach a custom label for the overall xAxis as a whole
    xAxis.children.push(am5.Label.new(root, { text: "Years experience", x: am5.p50, centerX: am5.p50 }));

    // Adjust the labels for each column in the xAxis, as it's not the numeric values that should be shown, since these are months (and years need to be shown)
    xAxis.get("renderer").labels.template.adapters.add("text", (value) => {
      return Math.floor(Number(value) / 12).toString();
    });

    // Create the series for the chart
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        categoryYField: "label",
        name: "Series 1",
        opacity: 0.7,
        tooltip: am5.Tooltip.new(root, {
          autoTextColor: false,
          getFillFromSprite: false,
          pointerOrientation: "left",
        }),
        valueXField: "value",
        xAxis: xAxis,
        yAxis: yAxis,
      })
    );

    // Custom settings to apply to the chart
    // ----
    // Rounded corners for columns
    series.columns.template.setAll({
      cornerRadiusTR: 5,
      cornerRadiusBR: 5,
    });

    // Colour each column as a differnt shade from the themes base colour
    series.columns.template.adapters.add("fill", (_, target) => {
      return chart.get("colors").getIndex(series.columns.indexOf(target));
    });

    // Do the same but for strokes of each column / bar
    series.columns.template.adapters.add("stroke", (_, target) => {
      return chart.get("colors").getIndex(series.columns.indexOf(target));
    });

    // Genrate dynamic tooltips, so that they show the amount of time each of the technologies has been used (to the current day)
    series.get("tooltip").adapters.add("labelText", (_, target) => {
      return getTechnologyDateDiff(target.dataItem?.dataContext["technology"]);
    });

    // Set styles for tooltips, specific to the current theme ("light" or "dark")
    series
      .get("tooltip")
      .get("background")
      .setAll({
        fill: am5.color(AMCHARTS_THEMES.barChart[theme].tooltip.background),
        strokeOpacity: 0,
      });

    series.get("tooltip").label.setAll({
      fill: am5.color(AMCHARTS_THEMES.barChart[theme].tooltip.colour),
    });

    // Set the data to be used within the chart
    const data = TECHNOLOGY_START_DATES.map((technology) => {
      return {
        ...technology,
        value: getMonthsAndYearsFromDateUntilNow(technology.startDate).months,
      };
    }).reverse();

    // Add a cursor to the chart, so that when hovering over it, there are crosshairs that react to mouse movements
    chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "none",
        xAxis: xAxis,
        yAxis: yAxis,
      })
    );

    // Custom theme-based styles for the cursor cross-hairs
    chart.get("cursor").lineX.setAll({
      stroke: am5.color(AMCHARTS_THEMES.barChart[theme].crosshairs),
    });

    chart.get("cursor").lineY.setAll({
      stroke: am5.color(AMCHARTS_THEMES.barChart[theme].crosshairs),
    });

    // Apply the data to the chart
    yAxis.data.setAll(data);
    series.data.setAll(data);

    return () => {
      root.dispose();
    };
  }, [theme]);

  return (
    <div className={styles["technology-experience-chart"]} {...buildDataAttributes("experience-chart", dataAttributes)}>
      <div id="technology-experience-chart" />
    </div>
  );
};

export default TechnologyExperienceChart;
