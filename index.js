const { json_list_to_external_table } = require("@saltcorn/data/plugin-helper");
//const { getTenantSchemaPrefix, sqlsanitize, is_it_multi_tenant, runWithTenant } = require("@saltcorn/data/db/state");
const { getAllTenantRows } = require("@saltcorn/admin-models/dist/models/tenant.js");
//const { getState } = require("@saltcorn/data/db/state");
const db = require("@saltcorn/data/db");
const User = require("@saltcorn/data/models/user");
const { get_base_url } = require("@saltcorn/data/models/config");

const sc_config_tenants = json_list_to_external_table(async () => {
  var tenants = [], current_found = false, current_schema = db.getTenantSchema();
  if (db.is_it_multi_tenant()) {
    const tenantList = await getAllTenantsRows();
    for (const tenantRow of tenantList) {
      tenant = {name: tenantRow.subdomain, 
                description: tenantRow.description,
                owner: tenantRow.owner,
                template: tenantRow.template,
                created: tenantRow.created}
      await db.runWithTenant(tenantRow.subdomain, function() {
        tenant.url = get_base_url();
        if(!tenant.owner && User.nonEmpty())
          tenant.owner = User.findOne({role_id: 1}).email;
        if(!current_found && db.getTenantSchema() == current_schema)
          current_found = true;
      });
      tenants.push(tenant);
    }
  }
  if (!current_found) {
    tenant = {name: db.getTenantSchema(),
              description: 'Default tenant',
              owner: User.findOne({role_id: 1}).email};
    tenants.unshift(tenant);
  }
  return tenants;
}, [
  { name: "name", type: "String", primary_key: true },
  { name: "description", type: "String" },
  { name: "url", type: "String" },
  { name: "owner", type: "String" },
  { name: "template", type: "String" },
  { name: "created", type: "Date" },
]);

module.exports = {
  sc_plugin_api_version: 1,
  // configuration_workflow: {},
  external_tables: { sc_config_tenants },
};
