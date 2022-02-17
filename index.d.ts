import { Knex } from "knex";
import { Adapter, AdapterConstructor } from "oidc-provider";


type AdapterOptions = {
  cleanup: false | number;
};

type CleanUp = {
  destroy(): void;
  cleaning(): Promise<void>;
}

declare function knexAdapter(client: Knex, options?: AdapterOptions): AdapterConstructor & CleanUp;
declare const defaultAdapter: Adapter;

export default defaultAdapter;
export { knexAdapter };
