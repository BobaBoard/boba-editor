import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    specPattern: "tests/**/*.spec.{js,ts,jsx,tsx}",
    video: false,
    screenshotOnRunFailure: false,
    chromeWebSecurity: false,
    supportFile: "./tests/utils/cypress/commands.js",
    devServer: {
      framework: "react",
      bundler: "webpack",
      // optionally pass in webpack config
      webpackConfig: require("./tests/utils/cypress/webpack.config.js"),
    },
    indexHtmlFile: "./tests/utils/cypress/cypress-root.html",
  },
});
