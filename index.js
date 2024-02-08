import { TelegramToken } from "./config/env.js";
import { setupJobs } from "./jobs/index.js";

if (!TelegramToken) {
	console.error("TELEGRAM_TOKEN is not set");
	process.exit(1);
}

console.log("Starting...");
await setupJobs();
