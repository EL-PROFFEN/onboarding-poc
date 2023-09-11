import { connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import * as schema from "./schema";

export const db = drizzle(
  connect({
    url: process.env.DATABASE_URL,
  }),
  { schema }
);
