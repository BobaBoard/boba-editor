/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const path = require("path");

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  require("@cypress/react/plugins/load-webpack")(on, config, {
    // from the root of the project (folder with cypress.json file)
    webpackFilename: path.resolve(__dirname, "webpack.config.js"),
  });
  return config;
};
