# oidc-provider-knex-adapter

An adapter for [panva/node-oidc-provider](https://github.com/panva/node-oidc-provider).

## usage example
General usage with a knex file:
```javascript
const knex = require("knex");
const config = require("./knexfile");
const { knexAdapter } = require(".");

const client = knex(config[process.env.NODE_ENV ?? "development"]);

const config = {
  /* ... */
  adapter: knexAdapter(client)
}
```
Or, if you don't care reusing the `knex` client:
```javascript
const { knexAdapter } = require(".");
const config = {
  /* ... */
  adapter: knexAdapter({ client: "pg" })
}
```
The default adapter with a default postgres connexion can also be used: 
```javascript
const config = {
  /* ... */
  adapter: require(".")
}
```
