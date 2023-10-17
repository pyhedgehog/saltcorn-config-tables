const { json_list_to_external_table } = require("@saltcorn/data/plugin-helper");
const { getState } = require("@saltcorn/data/db/state");

const sccfg_langs = json_list_to_external_table(
  async ({ where }) => {
    const state = getState();
    const current_schema = state.tenant;
    const cfg_languages = state.getConfig("localizer_languages", {});
    let languages = [];

    for (const info of Object.values(cfg_languages))
      languages.push({
        locale: info.locale,
        description: info.name,
        is_default: info.is_default,
      });
    return languages;
  },
  [
    { name: "locale", type: "String", primary_key: true },
    { name: "description", type: "String" },
    { name: "is_default", type: "Bool" },
  ],
);

const sccfg_translations = json_list_to_external_table(
  async ({ where }) => {
    const state = getState();
    const current_schema = state.tenant;
    const cfg_languages = state.getConfig("localizer_languages", {});
    const source_lang =
      Object.entries(cfg_languages)
        .filter(([lang, info]) => info.is_default)
        .map(([lang, info]) => lang)[0] || "en";
    const cfg_strings = state.getConfig("localizer_strings", {});
    const local_strings = state.getStringsForI18n();
    let result = [];
    const langs = new Set(
      [Object.keys(cfg_strings), Object.keys(cfg_languages)].flat(),
    );

    for (const target_lang of langs) {
      if (!target_lang || target_lang == source_lang) continue;
      if ((where || {}).target_lang && where.target_lang != target_lang)
        continue;
      const messages = Object.entries(cfg_strings[target_lang] || {});
      for (const [message, translation] of messages)
        result.push({ target_lang, source_lang, message, translation });
    }
    return result;
  },
  [
    { name: "source_lang", type: "String" },
    { name: "target_lang", type: "String" },
    { name: "message", type: "String" },
    { name: "translation", type: "String" },
  ],
);

const sccfg_untranslated = json_list_to_external_table(
  async ({ where }) => {
    const state = getState();
    const current_schema = state.tenant;
    const cfg_languages = state.getConfig("localizer_languages", {});
    const source_lang =
      (where || {}).source_lang ||
      Object.entries(cfg_languages)
        .filter(([lang, info]) => info.is_default)
        .map(([lang, info]) => lang)[0] ||
      "en";
    const cfg_strings = state.getConfig("localizer_strings", {});
    const local_strings = state.getStringsForI18n();
    let result = [];

    for (const target_lang of new Set(
      [Object.keys(cfg_strings), Object.keys(cfg_languages)].flat(),
    )) {
      if (!target_lang || target_lang == source_lang) continue;
      if ((where || {}).target_lang && where.target_lang != target_lang)
        continue;
      for (const message of local_strings)
        if (!(message in cfg_strings[target_lang]))
          result.push({ target_lang, source_lang, message });
    }
    return result;
  },
  [
    { name: "source_lang", type: "String" },
    { name: "target_lang", type: "String" },
    { name: "message", type: "String" },
  ],
);

exports = module.exports = {
  sccfg_langs,
  sccfg_translations,
  sccfg_untranslated,
};
