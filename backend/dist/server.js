"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_js_1 = __importDefault(require("./app.js"));
const index_js_1 = __importDefault(require("./logger/index.js"));
const PORT = process.env.PORT || 8080;
const server = app_js_1.default.listen(PORT, () => {
    index_js_1.default.info(`Server successfully started on port ${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
});
// Graceful shutdown handling
const shutdown = () => {
    index_js_1.default.info("Recieved terminate signal. Shutting down server gracefully.");
    server.close(() => {
        index_js_1.default.info("HTTP server closed.");
        process.exit(0);
    });
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
