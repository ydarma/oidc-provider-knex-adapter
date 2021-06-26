import { Knex } from "knex";
import { AdapterConstructor } from "oidc-provider";

declare function knexAdapter(client: Knex): AdapterConstructor;
export { knexAdapter };
