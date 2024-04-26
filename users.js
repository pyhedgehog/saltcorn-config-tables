const { json_list_to_external_table } = require("@saltcorn/data/plugin-helper");
const { getState, get_process_init_time } = require("@saltcorn/data/db/state");
const db = require("@saltcorn/data/db");
const User = require("@saltcorn/data/models/user");
const Table = require("@saltcorn/data/models/table");
const { get_base_url } = require("@saltcorn/data/models/config");

const { getAllTenantRows, alterExternalTable } = require("./utils.js");

const sccfg_roles = alterExternalTable(
  json_list_to_external_table(
    async ({ where }) => {
      return await User.get_roles();
    },
    [
      {
        name: "id",
        label: "ID",
        description: "Role ID",
        type: "Integer",
        primary_key: true,
        required: true,
        is_unique: true,
      },
      {
        name: "role",
        label: "Role",
        description: "Role name",
        type: "String",
        required: true,
        is_unique: true,
      },
    ],
  ),
  { child_relations: [{ table: "sccfg_users", field: "role_id" }] },
);

const sccfg_users = alterExternalTable(
  json_list_to_external_table(
    async ({ where }) => {
      return Array.prototype.map.call(
        await User.find(where),
        function ({
          id,
          email,
          role_id,
          disabled,
          api_token,
          language,
          _attributes,
          verification_token,
          verified_on,
          reset_password_token,
          reset_password_expiry,
          last_mobile_login,
        }) {
          return {
            id,
            user: id,
            email,
            role_id,
            disabled,
            api_token,
            language,
            _attributes,
            verification_token,
            verified_on,
            reset_password_token,
            reset_password_expiry,
            last_mobile_login,
          };
        },
      );
    },
    [
      {
        name: "id",
        label: "ID",
        description: "User ID",
        type: "Integer",
        primary_key: true,
        required: true,
        is_unique: true,
      },
      {
        name: "user",
        label: "User",
        description: "User ID",
        type: "Key",
        reftable_name: "users",
        refname: "id",
        reftype: "Integer",
        required: true,
        is_unique: true,
        attributes: { summary_field: "email" },
      },
      {
        name: "email",
        label: "eMail",
        description: "Login name",
        type: "String",
        required: true,
        is_unique: true,
      },
      {
        name: "role_id",
        label: "Role",
        description: "Role",
        type: "Key",
        is_fkey: true,
        reftable_name: "sccfg_roles",
        reftype: "Integer",
        required: true,
        attributes: { summary_field: "role" },
      },
      {
        name: "disabled",
        label: "Disabled",
        description: "Is user disabled",
        type: "Bool",
      },
      {
        name: "api_token",
        label: "api_token",
        description: "Token for REST API bearer authorization",
        type: "String",
      },
      {
        name: "language",
        label: "Language",
        description: "Configured user language",
        type: "String",
      },
      {
        name: "_attributes",
        label: "Attributes",
        description: "Extra Attributes",
        type: "JSON",
      },
      {
        name: "verification_token",
        label: "Verification token",
        description: "Token for email verification",
        type: "String",
      },
      {
        name: "verified_on",
        label: "Verified on",
        description: "Date email verified on",
        type: "Date",
      },
      {
        name: "reset_password_token",
        label: "Reset password token",
        description: "",
        type: "String",
      },
      {
        name: "reset_password_expiry",
        label: "Reset password expiry",
        description: "Reset password token expiry date",
        type: "Date",
      },
      {
        name: "last_mobile_login",
        label: "Last mobile login",
        description: "Last mobile login date",
        type: "Date",
      },
    ],
  ),
  { min_role_read: 1 },
);

exports = module.exports = { sccfg_roles, sccfg_users };
