require("dotenv").config(); // MUST be first

const { DEFAULT_PORT } = require("./config/constants");
const { connectDatabase } = require("./config/database");
const { createApp } = require("./app");

async function startServer(port = DEFAULT_PORT) {
  await connectDatabase();
  const app = createApp();

  return app.listen(port, () => {
    console.log(`EventAura backend running on http://localhost:${port}`);
  });
}

if (require.main === module) {
  startServer(Number(process.env.PORT || DEFAULT_PORT)).catch((error) => {
    console.error("Failed to start EventAura backend.", error);
    process.exit(1);
  });
}

module.exports = {
  startServer,
};