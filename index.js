module.exports = {
  sc_plugin_api_version: 1,
  // configuration_workflow: {},
  external_tables: {
    ...require("./tenants.js"),
    ...require("./languages.js"),
    ...require("./plugins.js"),
    ...require("./users.js"),
  },
};
