const { getState } = require("@saltcorn/data/db/state");
const db = require("@saltcorn/data/db");

async function getAllTenantRows() {
  return await db.select("_sc_tenants");
}

function alterExternalTable(tbl, opts, overrides) {
  const extras = {
    ...(opts.min_role_read
      ? Object.getOwnPropertyDescriptors({
          get min_role_read() {
            const roles = getState().getConfig("exttables_min_role_read", {});
            return roles[tbl.name] || opts.min_role_read;
          },
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
