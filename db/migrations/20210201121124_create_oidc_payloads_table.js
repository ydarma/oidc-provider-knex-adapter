exports.up = function (knex) {
  return knex.schema.hasTable("oidc_payloads").then(async b => {
    if (!b)
      await knex.schema.createTable("oidc_payloads", t => {
        t.string("id");
        t.integer("type");
        t.text("payload");
        t.string("grantId");
        t.string("userCode");
        t.string("uid");
        t.dateTime("expiresAt");
        t.dateTime("consumedAt");
        t.primary(["id", "type"]);
      });
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("oidc_payloads");
};
