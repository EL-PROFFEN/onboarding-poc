import { insertMemberSchema, member } from "~/drizzle/schema";

import csv from "csv-parser";
import fs from "fs";
import { db } from "~/drizzle/db";

fs.createReadStream("scripts/members.csv")
  .pipe(csv())
  .on("data", async (row) => {
    const validatedRow = insertMemberSchema.parse(row);
    await db.insert(member).values(validatedRow);
  })
  .on("end", () => {
    console.log("CSV file successfully processed");
  });
