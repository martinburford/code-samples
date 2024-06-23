// Configuration
import packageJson from "./package.json" assert { type: "json" };
import tsConfigJson from "./tsconfig.json" assert { type: "json" };

// NPM imports
import alias from "@rollup/plugin-alias";
import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import svgr from "@svgr/rollup";
import path from "path";

import css from "rollup-plugin-import-css";
import dts from "rollup-plugin-dts";
import external from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";

export default [
  {
    input: "index.ts",
    output: [
      { file: packageJson.main, format: "cjs", sourcemap: true },
      { file: packageJson.module, format: "esm", sourcemap: true },
    ],
    plugins: [
      alias({
        entries: {
          assets: path.resolve("./assets"), // Need in order to convert imported SVGs into SVG JavaScript objects
        },
      }),
      nodeResolve(),
      postcss(),
      commonjs(),
      babel({
        presets: ["@babel/env", "@babel/preset-react"],
        babelHelpers: "bundled",
      }),
      external(),
      svgr(),
      typescript({ tsconfig: "./tsconfig.json", exclude: ["**/*.test.tsx", "**/*.test.ts"] }),
      terser(),
    ],
  },
  {
    external: [/\.scss$/],
    input: "dist/esm/types/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [
      // The following 2x plugins are required in order to resolve the imports for SwiperJS, which are in the form of `import "cssfile" from swiper`
      nodeResolve(),
      css(),

      // Generate all type definiton files
      dts({
        // This will ensure aliases used within .dts files are resolved, based on the baseUrl and paths within tsConfig.json
        compilerOptions: {
          baseUrl: tsConfigJson.compilerOptions.baseUrl,
          paths: tsConfigJson.compilerOptions.paths,
        },
      }),
    ],
  },
];
