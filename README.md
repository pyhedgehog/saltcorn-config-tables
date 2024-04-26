# saltcorn-config-tables

## Tables provided

1. sccfg_tenants - list of tenants available (useful for menu dynamic links)
2. sccfg_plugins - list of installed plugins
3. sccfg_plugins_store - list of available plugins (roughtly `getState().getConfig('available_plugins', [])`).
4. sccfg_langs - list of languages (will be useful once [#1393](https://github.com/saltcorn/saltcorn/issues/1393) implemented)
5. sccfg_translations - list of string translations per language
6. sccfg_untranslated - list of untranslated strings per language
7. sccfg_roles - list of user roles
8. sccfg_users - list of users with additional columns

## TODO

- Wiki page for documentation link
- Descriptions of tables and columns
- Plugin configuration to enable/disable tables
- Plugin configuration to include entries from other tenants to `sccfg_*` tables of `admin_*` tables.
- Table for localization strings (`select lang,srctext,tgttext from _sc_config t, jsonb_each(t.value->'v') l(lang,langmap), jsonb_each_text(langmap) _(srctext,tgttext) where t.key='localizer_strings'`)
- Table for configuration as a whole
- Tables for packs (installed and available)
- Table for available snapshots
- Tables for menu items (original and unrolled) with crafted identifiers and parent fkeys
- Tables to access other `_sc_*` tables (files, tables, views, pages, roles, triggers). May be some of them should be disabled by default.
