const { json_list_to_external_table } = require("@saltcorn/data/plugin-helper");
//const { getTenantSchemaPrefix, sqlsanitize, is_it_multi_tenant, runWithTenant } = require("@saltcorn/data/db/state");
//const { getAllTenantsRows } = require("@saltcorn/admin-models/dist/models/tenant.js");
const { getState, getAllTenants, get_process_init_time } = require("@saltcorn/data/db/state");
const db = require("@saltcorn/data/db");
const User = require("@saltcorn/data/models/user");
//const { Tenant } = require("@saltcorn/admin-models/dist/models/tenant");
//const { Tenant } = require("@saltcorn/admin-models/models/tenant");
const { get_base_url } = require("@saltcorn/data/models/config");

const { getAllTenantsRows, alterExternalTable } = require("./utils.js");

const sccfg_tenants = alterExternalTable(json_list_to_external_table(async ({where}) => {
  const current_state = getState();
  let current_schema = db.getTenantSchema();
  current_schema = current_schema?current_schema:current_state.tenant;
  const dummy_tenant = {name: current_schema,
              description: 'Default tenant',
              url: get_base_url(),
              owner: User.findOne({role_id: 1}).email,
              template: null,
              created: get_process_init_time()};
  var tenants = [], current_found = false;
  //const all_tenants = getAllTenants();
  //console.log('all_tenants =', all_tenants);
  //for (const tenantState of Object.values(all_tenants)) {
  //  const tenantRow = Tenant.findOne({subdomain: tenantState.tenant});
  //  let tenant = {subdomain: tenantState.tenant,
  //            description: tenantRow?.description?tenantRow.description:'',
  //            owner: tenantRow?.owner?tenantRow.owner:null,
  //            template: tenantRow?.template?tenantRow.template:null,
  //            created: tenantRow?.created?tenantRow.created:get_process_init_time() }
  const all_tenants = await getAllTenantsRows();
  for(const tenantRow of all_tenants) {
    console.log('tenantRow =', tenantRow);
    let tenant = { subdomain: tenantRow.subdomain,
              description: tenantRow.description,
              owner: tenantRow.email,
              template: tenantRow.template,
              created: tenantRow.created };
    await db.runWithTenant(tenant.subdomain, function() {
      tenant.url = get_base_url();
      if(!tenant.owner && User.nonEmpty()) {
        tenant.owner = User.findOne({role_id: 1}).email;
        console.log('new tenant.owner =', tenant.owner);
      }
      if(!current_found) {
        const schema = db.getTenantSchema();
        if(schema?schema:tenant.subdomain == current_schema)
          current_found = true;
      }
    });
    console.log('tenant res =', tenant);
    tenants.push(tenant);
  }
  if (!current_found)
    tenants.unshift(dummy_tenant);
  return tenants;
}, [
  { name: "subdomain", type: "String", primary_key: true },
  { name: "description", type: "String" },
  { name: "url", type: "String", unique: true },
  { name: "owner", type: "String" },
  { name: "template", type: "String" },
  { name: "created", type: "Date" },
]), { min_role_read: 1 });

exports = module.exports = { sccfg_tenants };
