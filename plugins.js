const { json_list_to_external_table } = require("@saltcorn/data/plugin-helper");
const { getState, get_process_init_time } = require("@saltcorn/data/db/state");
const db = require("@saltcorn/data/db");

const { alterExternalTable } = require("./utils.js");

const sccfg_plugins = alterExternalTable(
  json_list_to_external_table(
    async ({ where }) => {
      const available_plugin_ids = Object.fromEntries(
        getState()
          .getConfig("available_plugins", [])
          .map((r) => [[r.source, r.location].join("/"), r.id]),
      );
      return (await db.select("_sc_plugins", where)).map(function (row) {
        row.store_id =
          available_plugin_ids[[row.source, row.location].join("/")] || null;
        return row;
      });
    },
    [
      { name: "id", label: "ID", type: "Integer", primary_key: true },
      {
        name: "store_id",
        label: "Store ID",
        type: "Key",
        reftable_name: "sccfg_plugins_store",
        attributes: { on_delete: "Set null" },
        refname: "id",
        reftype: "Integer",
      },
      { name: "name", type: "String", unique: true },
      {
        name: "source",
        type: "String",
        attributes: { options: "npm,github,git,local" },
        required: true,
      },
      { name: "location", type: "String", required: true },
      { name: "version", type: "String" },
      { name: "configuration", type: "JSON" },
    ],
  ),
  { min_role_read: 1 },
);

const sccfg_plugins_store = alterExternalTable(
  json_list_to_external_table(
    async ({ where }) => {
      return getState().getConfig("available_plugins", []);
    },
    [
      { name: "id", label: "ID", type: "Integer", primary_key: true },
      { name: "name", type: "String", unique: true },
      {
        name: "source",
        type: "String",
        attributes: { options: "npm,github,git,local" },
        required: true,
      },
      { name: "location", type: "String", required: true },
      { name: "unsafe", type: "Bool" },
      { name: "has_auth", type: "Bool" },
      { name: "has_theme", type: "Bool" },
      { name: "description", type: "String" },
      { name: "documentation_link", type: "String" },
    ],
  ),
  {
    min_role_read: 1,
    child_relations: [{ table: "sccfg_plugins", field: "store_id" }],
  },
);

exports = module.exports = {
  sccfg_plugins,
  sccfg_plugins_store,
};
