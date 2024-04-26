const { getState } = require("@saltcorn/data/db/state");
const db = require("@saltcorn/data/db");
const Table = require("@saltcorn/data/models/table");

async function getAllTenantRows() {
  return await db.select("_sc_tenants");
}

function alterExternalTable(tbl, opts, overrides) {
  const fkeys = tbl.fields.filter((f) => f.is_fkey);
  const extras = {
    ...(opts.min_role_read
      ? Object.getOwnPropertyDescriptors({
          get min_role_read() {
            const roles = getState().getConfig("exttables_min_role_read", {});
            return roles[tbl.name] || opts.min_role_read;
          },
        })
      : {}),
    ...(opts.child_relations
      ? Object.getOwnPropertyDescriptors({
          async get_child_relations() {
            let child_relations = [];
            let child_field_list = [];
            for (const { table: tableName, field } of opts.child_relations) {
              const table = Table.findOne({ name: tableName });
              const key_field = await table.getField(field);
              child_field_list.push(`${tableName}.${field}`);
              child_relations.push({ key_field, table });
            }
            return { child_relations, child_field_list };
          },
        })
      : {}),
    ...(fkeys.length > 0
      ? Object.getOwnPropertyDescriptors({
          async get_parent_relations() {
            let parent_relations = [];
            let parent_field_list = [];
            for (const f of fkeys) {
              const table = Table.findOne({ name: f.reftable_name });
              (await table.getFields()).forEach((rf) => {
                parent_field_list.push(`${f.name}.${rf.name}`);
              });
              parent_relations.push({ key_field: f, table });
            }
            console.log(
              `get_parent_relations for ${tbl.name}: ${JSON.stringify({ parent_relations, parent_field_list })}`,
            );
            return { parent_relations, parent_field_list };
          },
          getField: Table.prototype.getField,
        })
      : {}),
  };
  if (Object.keys(extras).length > 0) Object.defineProperties(tbl, extras);
  if (overrides && Object.keys(overrides).length > 0)
    Object.defineProperties(tbl, Object.getOwnPropertyDescriptors(overrides));
  return tbl;
}

exports = module.exports = {
  getAllTenantRows,
  alterExternalTable,
};
