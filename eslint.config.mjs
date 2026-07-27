// @ts-check
import globals from "globals";

import NodeConfig from "@prdev-solutions/eslint-config/node.mjs";

export default [
  ...NodeConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      },
      sourceType: "commonjs",
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  }
];
