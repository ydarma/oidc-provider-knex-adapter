const knex = require("knex");
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

function knexAdapter(client) {

  let _client = undefined;
  let _cleaner = undefined;
  let _lastCleaned = Date.now();

  function getClient() {
    if (typeof _client == "undefined")
      _client = typeof client == "function" ? client : knex(client);
    return _client;
  }

  function cleaner(adapter) {
    if (shouldClean())
      _cleaner = clean().then(() => adapter);
    return _cleaner;
  }

  function shouldClean() {
    return typeof _cleaner == "undefined" ||
      Date.now() > _lastCleaned + 3600000;
  }

  function clean() {
    return getClient()
      .table(oidc_payloads)
      .where("expiresAt", "<", new Date())
      .delete();
  }

  return class DbAdapter {
    constructor(name) {
      this.client = getClient();
      this.name = name;
      this.type = types[name];
      this.cleaned = cleaner(this);
    }

    async upsert(id, payload, expiresIn) {
      const expiresAt = this.getExpireAt(expiresIn);
      await this.client
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

    getExpireAt(expiresIn) {
      return expiresIn
        ? new Date(Date.now() + expiresIn * 1000)
        : undefined;
    }

    get _table() {
      return this.client.table(oidc_payloads).where("type", this.type);
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
  };
}

const defaultConfig = {
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",
    password: "*********",
    database: "postgres"
  }
};
const defaultAdapter = knexAdapter(defaultConfig)
defaultAdapter.knexAdapter = knexAdapter

module.exports = defaultAdapter