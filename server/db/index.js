import "dotenv/config";
import knex from "knex";

const url = new URL(process.env.DB_URL);

const db = knex({
  client: "pg",
  connection: {
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.substr(1),
    ssl: { rejectUnauthorized: false },
  },
});

export default db;
