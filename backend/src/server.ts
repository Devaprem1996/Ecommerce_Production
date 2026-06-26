import "dotenv/config";
import app from "./app.js";
import logger from "./logger/index.js";

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  logger.info(`Server successfully started on port ${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
});

// Graceful shutdown handling
const shutdown = () => {
  logger.info("Recieved terminate signal. Shutting down server gracefully.");
  server.close(() => {
    logger.info("HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
