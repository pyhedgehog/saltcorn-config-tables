const { json_list_to_external_table } = require("@saltcorn/data/plugin-helper");
const { getState } = require("@saltcorn/data/db/state");
const db = require("@saltcorn/data/db");
//const { getAllTenantsRows } = require("./utils.js");

const sccfg_langs = json_list_to_external_table(async ({where}) => {
  const state = getState();
  const current_schema = state.tenant;
  const cfg_languages = state.getConfig('localizer_languages', {});
  let languages = [];

  for(const info of Object.values(cfg_languages))
    languages.push({	locale: info.locale,
			description: info.name,
			is_default: info.is_default });
  return languages;
}, [
  { name: "locale", type: "String", primary_key: true },
  { name: "description", type: "String" },
  { name: "is_default", type: "Bool" },
]);

exports = module.exports = { sccfg_langs };
