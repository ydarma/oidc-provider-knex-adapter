const t = require("tap");
const { test } = t;
const knex = require("knex");
const config = require("./knexfile");
const { knexAdapter } = require(".");
const { v4: uuid } = require("uuid");
const assert = require("assert");

const clientConfig = config[process.env.NODE_ENV ?? "development"];
const client = knex(clientConfig);
const DbAdapter = knexAdapter(client, { cleanup: false });

t.teardown(() => client.destroy());

deepLooseEqual = (actual, expected) => t.doesNotThrow(() => assert.deepStrictEqual(actual, expected), "should be deep equal");

test("Upsert id", async t => {
  const adapter = new DbAdapter("ClientCredentials");
  const id = uuid();
  const data0 = { test: ["aa"] };
  await adapter.upsert(id, data0);
  const result0 = await adapter.find(id);
  const data1 = { test: ["nn"] };
  await adapter.upsert(id, data1);
  const result1 = await adapter.find(id);
  deepLooseEqual(result0, data0);
  deepLooseEqual(result1, data1);
  t.end();
});

test("Upsert with user code", async t => {
  const adapter = new DbAdapter("DeviceCode");
  const id = uuid();
  const keyId = uuid();
  const data = { test: ["aa"], userCode: keyId };
  await adapter.upsert(id, data);
  const result = await adapter.findByUserCode(keyId);
  deepLooseEqual(result, data);
  t.end();
});

test("Upsert with user uid", async t => {
  const adapter = new DbAdapter("Session");
  const id = uuid();
  const keyId = uuid();
  const data = { test: ["aa"], uid: keyId };
  await adapter.upsert(id, data);
  const result = await adapter.findByUid(keyId);
  deepLooseEqual(result, data);
  t.end();
});

test("Destroy", async t => {
  const adapter = new DbAdapter("Interaction");
  const id0 = uuid();
  const id1 = uuid();
  const data = { test: ["aa"] };
  await adapter.upsert(id0, data);
  await adapter.upsert(id1, data);
  await adapter.destroy(id0);
  const result0 = await adapter.find(id0);
  const result1 = await adapter.find(id1);
  t.notOk(result0);
  deepLooseEqual(result1, data);
  t.end();
});

test("Revoke", async t => {
  const adapter = new DbAdapter("AuthorizationCode");
  const id = uuid();
  const keyId = uuid();
  const data = { test: ["aa"], grantId: keyId };
  await adapter.upsert(id, data);
  await adapter.revokeByGrantId(keyId);
  const result = await adapter.find(id);
  t.notOk(result);
  t.end();
});

test("Consume", async t => {
  const adapter = new DbAdapter("AccessToken");
  const id = uuid();
  const data = { test: ["aa"] };
  await adapter.upsert(id, data);
  await adapter.consume(id);
  const result = await adapter.find(id);
  deepLooseEqual(result, { ...data, consumed: true });
  t.end();
});

test("Clean expired", async t => {
  const testAdapter = knexAdapter(client, { cleanup: 1 });
  const adapter = new testAdapter("AccessToken");
  const id = uuid();
  const data = { test: ["aa"] };
  await adapter.upsert(id, data, 1);
  await new Promise(r => {
    setTimeout(() => { r(testAdapter.cleaning) }, 1050)
  })
  const result = await adapter.find(id);
  t.notOk(result);
  testAdapter.destroy();
  t.end();
});

test("Adapter from config", async t => {
  const defaultAdapter = knexAdapter(clientConfig)
  const adapter = new defaultAdapter("AccessToken");
  t.ok(typeof adapter.upsert == "function");
  t.ok(typeof adapter.find == "function");
  defaultAdapter.destroy();
  t.end();
});
