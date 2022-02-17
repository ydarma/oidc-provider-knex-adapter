/*
 * Tests, pakcage.json and usage examples can be found here :
 * https://github.com/ydarma/oidc-provider-knex-adapter
 * This code is provided under "The Unlicense"
 */

const knex = require("knex");
const config = require("./knexfile");
const oidc_payloads = "oidc_payloads";

const types = [
  "Session",
  "AccessToken",
  "AuthorizationCode",
  "RefreshToken",
  "DeviceCode",
  "ClientCredentials",
  "Client",
  "InitialAccessToken",
  "RegistrationAccessToken",
  "Interaction",
  "ReplayDetection",
  "PushedAuthorizationRequest",
  "Grant",
].reduce((map, name, i) => ({ ...map, [name]: i + 1 }), {});

function knexAdapter(client, options = { cleanup: 3600 }) {

  let _cleaner = undefined;
  let _cleaning = undefined;

  client = typeof client == "function" ? client : knex(client);

  function clean() {
    _cleaning = client
      .table(oidc_payloads)
      .where("expiresAt", "<", new Date())
      .delete();
  }

  function getExpireAt(expiresIn) {
    return expiresIn
      ? new Date(Date.now() + expiresIn * 1000)
      : undefined;
  }

  if (options.cleanup)
    _cleaner = setInterval(clean, options.cleanup * 1000);

  return class DbAdapter {
    constructor(name) {
      this.name = name;
      this.type = types[name];
    }

    async upsert(id, payload, expiresIn) {
      const expiresAt = getExpireAt(expiresIn);
      await client
        .table(oidc_payloads)
        .insert({
          id,
          type: this.type,
          payload: JSON.stringify(payload),
          grantId: payload.grantId,
          userCode: payload.userCode,
          uid: payload.uid,
          expiresAt,
        })
        .onConflict(["id", "type"])
        .merge();
    }

    get _table() {
      return client
        .table(oidc_payloads)
        .where("type", this.type);
    }

    _rows(obj) {
      return this._table.where(obj);
    }

    _result(r) {
      return r.length > 0
        ? {
          ...JSON.parse(r[0].payload),
          ...(r[0].consumedAt ? { consumed: true } : undefined),
        }
        : undefined;
    }

    _findBy(obj) {
      return this._rows(obj).then(this._result);
    }

    find(id) {
      return this._findBy({ id });
    }

    findByUserCode(userCode) {
      return this._findBy({ userCode });
    }

    findByUid(uid) {
      return this._findBy({ uid });
    }

    destroy(id) {
      return this._rows({ id }).delete();
    }

    revokeByGrantId(grantId) {
      return this._rows({ grantId }).delete();
    }

    consume(id) {
      return this._rows({ id }).update({ consumedAt: new Date() });
    }

    static destroy() {
      clearInterval(_cleaner);
    }

    static get cleaning() {
      return _cleaning;
    }
  };
}

module.exports = { knexAdapter }