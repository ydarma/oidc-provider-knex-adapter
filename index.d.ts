import { Knex } from "knex";
import { Adapter, AdapterConstructor } from "oidc-provider";


type AdapterOptions = {
  cleanup: false | number = false;
};

declare function knexAdapter(client: Knex, options: AdapterOptions = {}): AdapterConstructor;
declare const defaultAdapter: Adapter;

export default defaultAdapter;
export { knexAdapter };
