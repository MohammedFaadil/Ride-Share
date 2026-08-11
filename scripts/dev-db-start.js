// Local-only dev database bootstrap: starts a real Postgres instance via
// embedded-postgres (persistent, survives this script exiting — pg_ctl
// daemonizes it) so `npm run dev` has something to talk to without requiring
// Docker. Not used in production (Render provisions its own managed
// Postgres — see render.yaml).
const path = require("path");
const EmbeddedPostgres = require("embedded-postgres").default;

const dataDir = path.join(__dirname, "..", ".devdb");

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: "roamly",
  password: "roamly",
  port: 5432,
  persistent: true,
});

(async () => {
  try {
    await pg.initialise();
    console.log("Initialised new local Postgres data directory.");
  } catch {
    console.log("Reusing existing local Postgres data directory.");
  }
  await pg.start();
  try {
    await pg.createDatabase("roamly");
    console.log("Created 'roamly' database.");
  } catch {
    console.log("'roamly' database already exists.");
  }
  console.log("READY: postgresql://roamly:roamly@127.0.0.1:5432/roamly");
})();
