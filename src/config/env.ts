import * as dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.PORT || 3000),
  dbUrl: process.env.DATABASE_URL ?? "postgres://postgres:admin@localhost:5432/payments",
  nodeEnv: process.env.NODE_ENV ?? "development",
};
