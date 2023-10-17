const { json_list_to_external_table } = require("@saltcorn/data/plugin-helper");
const { getState, get_process_init_time } = require("@saltcorn/data/db/state");
const db = require("@saltcorn/data/db");
const User = require("@saltcorn/data/models/user");
const { get_base_url } = require("@saltcorn/data/models/config");

const { getAllTenantRows, alterExternalTable } = require("./utils.js");

const sccfg_tenants = alterExternalTable(
  json_list_to_external_table(
    async ({ where }) => {
      const current_state = getState();
      let current_schema = db.getTenantSchema();
      current_schema = current_schema ? current_schema : current_state.tenant;
      const dummy_tenant = {
        subdomain: current_schema,
        description: "Default tenant",
        url: get_base_url(),
        owner: (await User.findOne({ role_id: 1 })).email,
        template: null,
        created: get_process_init_time(),
      };
      var tenants = [],
        current_found = false;
      const all_tenants = await getAllTenantRows();
      for (const tenantRow of all_tenants) {
        let tenant = {
          subdomain: tenantRow.subdomain,
          description: tenantRow.description,
          owner: tenantRow.email,
          template: tenantRow.template,
          created: tenantRow.created,
        };
        await db.runWithTenant(tenant.subdomain, async function () {
          tenant.url = get_base_url();
          if (!tenant.owner && User.nonEmpty()) {
            tenant.owner = (await User.findOne({ role_id: 1 })).email;
          }
          if (!current_found) {
            const schema = db.getTenantSchema();
            if ((schema ? schema : tenant.subdomain) === current_schema) {
              current_found = true;
            }
          }
        });
        tenants.push(tenant);
      }
      if (!current_found) tenants.unshift(dummy_tenant);
      return tenants;
    },
    [
      { name: "subdomain", type: "String", primary_key: true },
      { name: "description", type: "String" },
      { name: "url", type: "String", unique: true },
      { name: "owner", type: "String" },
      { name: "template", type: "String" },
      { name: "created", type: "Date" },
    ],
  ),
  { min_role_read: 1 },
);

exports = module.exports = { sccfg_tenants };
