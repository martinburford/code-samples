"use client";

// Context
import ThemeContext from "context/providers/theme";

// NPM imports
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import { colord, extend } from "colord";
import harmoniesPlugin from "colord/plugins/harmonies";
import { useContext, useLayoutEffect } from "react";

// Scripts
import { AMCHARTS_THEMES, colourHexes } from "scripts/consts";
import { currentBreakpoint } from "scripts/responsive";
import { buildDataAttributes } from "scripts/utilities";

// Styles
import styles from "./typical-work-day-chart.module.scss";

// Types
import { ITypicalWorkDayChart } from "./types/typical-work-day-chart.types";
import { EBreakpoints } from "types/enums";

extend([harmoniesPlugin]);

export const TypicalWorkDayChart: React.FC<ITypicalWorkDayChart> = ({ dataAttributes = {} }) => {
  // Hooks (context)
  const { theme } = useContext(ThemeContext);

  // What is the current breakpoint being used? Since the chart has some settings which are breakpoint specific
  const breakpoint = currentBreakpoint();

  useLayoutEffect(() => {
    // Is a smaller breakpoint being used?
    const isSmallerBreakpoint = breakpoint === EBreakpoints.MOBILE;

    // Based on a root colour (for both "dark" and "light" modes), calculate complimentary colours
    const baseColour = colord(theme === "dark" ? colourHexes.WARNING_200 : colourHexes.PRIMARY_500);

    const analogous = baseColour.harmonies("analogous").map((c) => c.toHex());
    const complimentary = baseColour.harmonies("complementary").map((c) => c.toHex());
    const splitComplimentary = baseColour.harmonies("split-complementary").map((c) => c.toHex());
    const triadic = baseColour.harmonies("triadic").map((c) => c.toHex());

    // Order
    // complimentary[1]
    // analogous[0]
    // analogous[2]
    // splitComplimentary[1]
    // splitComplimentary[2]
    // triadic[1]
    // triadic[2]

    // The data for the segments
    const data = [
      {
        item: "Coding",
        itemWrapped: "Coding",
        percent: 40,
        sliceSettings: {
          fill: am5.color(complimentary[1]),
        },
      },
      {
        item: "Meetings",
        itemWrapped: "Meetings",
        percent: 15,
        sliceSettings: {
          fill: am5.color(analogous[0]),
        },
      },
      {
        item: "Paired coding",
        itemWrapped: "Paired<br />coding",
        percent: 15,
        sliceSettings: {
          fill: am5.color(analogous[2]),
        },
      },
      {
        item: "Emails",
        itemWrapped: "Emails",
        percent: 10,
        sliceSettings: {
          fill: am5.color(splitComplimentary[1]),
        },
      },
      {
        itemWrapped: "Responsive<br />UI work",
        item: "Responsive UI work",
        percent: 10,
        sliceSettings: {
          fill: am5.color(splitComplimentary[2]),
        },
      },
      {
        item: "Code reviews",
        itemWrapped: "Code<br />reviews",
        percent: 5,
        sliceSettings: {
          fill: am5.color(triadic[1]),
        },
      },
      {
        item: "Git",
        itemWrapped: "Git",
        percent: 5,
        sliceSettings: {
          fill: am5.color(triadic[2]),
        },
      },
    ];

    // Create root element
    const root = am5.Root.new("typical-work-day-chart", {
      useSafeResolution: false, // This ensures on touch devices there is no compression in the quality of fonts and edges within the canvas
    });

    // Create chart
    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        innerRadius: am5.percent(40),
        radius: am5.percent(90),
      })
    );

    // Create series
    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        categoryField: isSmallerBreakpoint ? "itemWrapped" : "item",
        name: "Series",
        valueField: "percent",
      })
    );

    // Derive custom colours from the dataset
    series.slices.template.setAll({
      templateField: "sliceSettings",
    });

    // Disable hover tooltips from showing
    series.slices.template.set("tooltipText", "");

    // Set data
    series.data.setAll(data);

    series.labels.template.setAll({
      fill: am5.color(AMCHARTS_THEMES.pieChart[theme].series.label),
      maxWidth: isSmallerBreakpoint ? 120 : 200,
      oversizedBehavior: "wrap",
      html: isSmallerBreakpoint ? "{category}" : "{category} ... <strong>{percent}%</strong>"
    });

    series.ticks.template.setAll({
      length: 1,
      location: 0.7,      
      stroke: am5.color(AMCHARTS_THEMES.pieChart[theme].series.tick),
      strokeOpacity: 1,
      strokeWidth: 1,
    });

    // Adding gradients
    series.slices.template.set(
      "fillGradient",
      am5.RadialGradient.new(root, {
        stops: [
          {
            brighten: -0.8,
          },
          {
            brighten: -0.8,
          },
          {
            brighten: -0.5,
          },
          {
            brighten: 0,
          },
          {
            brighten: -0.5,
          },
        ],
      })
    );

    // Disable pull-out (clicking on segments and them expanding)
    series.slices.template.set("toggleKey", "none");

    // Change the opacity of the segments, along with hiding the border / stroke
    series.slices.template.setAll({
      fillOpacity: AMCHARTS_THEMES.pieChart[theme].series.fillOpacity,
      strokeOpacity: 0,
    });

    return () => {
      root.dispose();
    };
  }, [theme, breakpoint]);

  return (
    <>
      <div
        className={styles["typical-work-day-chart"]}
        {...buildDataAttributes("typical-work-day-chart", dataAttributes)}
      >
        <div id="typical-work-day-chart" />
      </div>
    </>
  );
};

export default TypicalWorkDayChart;
