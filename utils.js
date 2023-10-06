const { getState } = require("@saltcorn/data/db/state");
const db = require("@saltcorn/data/db");

async function getAllTenantsRows() {
  return await db.select('_sc_tenants');
}

function alterExternalTable(tbl, opts) {
  const extras = {
    ...(opts.min_role_read?Object.getOwnPropertyDescriptors({get min_role_read() {
      const roles = getState().getConfig("exttables_min_role_read", {});
      return roles[tbl.name] || opts.min_role_read;
    }}):{}),
  };
  Object.defineProperties(tbl, extras);
  return tbl;
}

exports = module.exports = {
  getAllTenantsRows,
  alterExternalTable,
};
