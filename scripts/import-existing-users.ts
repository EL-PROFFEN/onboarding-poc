import { insertExistingUserSchema, existingUser } from "~/drizzle/schema";

import csv from "csv-parser";
import fs from "fs";
import { db } from "~/drizzle/db";

fs.createReadStream("data/existing_users.csv")
  .pipe(csv())
  .on("data", async (row) => {
    const validatedRow = insertExistingUserSchema.parse(row);
    await db.insert(existingUser).values(validatedRow);
  })
  .on("end", () => {
    console.log("CSV file successfully processed");
  });
