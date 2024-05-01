import { CronJob } from "cron";
import { Settings } from "../config/settings.js";
import LcdClient from "../lib/lcd.js";
import database from "../services/database.js";
import { sendProposalToTelegram } from "../services/telegram.js";

const NewProposalMiliseconds = 1000 * 60 * 60 * 24 * 7;

export default function checkProposalsJob() {
	let isRunning = false;
	const cronJob = new CronJob("* * * * *", async () => {
		if (isRunning) {
			console.log("checkProposalsJob is already running.");
			return;
		}

		isRunning = true;
		try {
			console.log("checkProposalsJob started.");

			const chains = Settings["chains"];
			await Promise.all(chains.map((chain) => processProposals(chain)));

			console.log("checkProposalsJob finished.");
		} catch (error) {
			console.log("checkProposalsJob got error", error);
		} finally {
			isRunning = false;
		}
	});
	cronJob.start();
}

async function processProposals(chain) {
	try {
		const lcdClient = new LcdClient(chain.lcd);
		var proposals = [];
		console.log("crawling proposals:", chain.name);
		if (chain.govenanceVer === "v1") {
			proposals = await lcdClient.getProposalsV1();
		} else {
			proposals = await lcdClient.getProposalsV1beta1();
		}
		for (const proposal of proposals) {
			const existProposal = await database.getExistsProposal(
				proposal.id,
				chain.name
			);
			if (existProposal) {
				continue;
			}

			// check proposal is new
			if (proposal.submitTime.getTime() < Date.now() - NewProposalMiliseconds) {
				console.log(`[${chain.name}]Proposal ${proposal.id} is too old.`);
				continue;
			}
			await sendProposalToTelegram(proposal, chain);
			await database.createProposal(proposal.id, chain.name);
		}
	} catch (error) {
		console.log(`[${chain.name}] processProposals error`, error);
	}
}
