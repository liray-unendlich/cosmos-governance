import { TelegramToken } from "./config/env.js";
import { setupJobs } from "./jobs/index.js";
import database from "./services/database.js";

if (!TelegramToken) {
	console.error("TELEGRAM_TOKEN is not set");
	process.exit(1);
}

// Initialize mysql
console.log("Initializing database...");
await database.initializeDatabase().catch(console.error);

console.log("Starting...");
await setupJobs();
