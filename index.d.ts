import { Knex } from "knex";
import { Adapter, AdapterConstructor } from "oidc-provider";

declare function knexAdapter(client: Knex, cleanInterval?: number): AdapterConstructor;
declare const defaultAdapter: Adapter;

export default defaultAdapter;
export { knexAdapter };
