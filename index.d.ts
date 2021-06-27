import { Knex } from "knex";
import { Adapter, AdapterConstructor } from "oidc-provider";


type AdapterOptions = {
  cleanup: "never" | number = "never";
};

declare function knexAdapter(client: Knex, options: AdapterOptions = {}): AdapterConstructor;
declare const defaultAdapter: Adapter;

export default defaultAdapter;
export { knexAdapter };
