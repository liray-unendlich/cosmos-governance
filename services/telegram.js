import TelegramBot from "node-telegram-bot-api";
import { TelegramToken, TgChannelId } from "../config/env.js";

const telegram = new TelegramBot(TelegramToken, {
	polling: true,
});

export async function sendMessageToTelegram(chatId, message) {
	try {
		await telegram.sendMessage(chatId, message, { parse_mode: "Markdown" });
	} catch (error) {
		console.log("sendMessageToTelegram error", error);
	}
}

export async function sendProposalToTelegram(proposal, chain) {
	const cliMessage = `\`\`\`bash ${chain.binaryName} tx gov vote ${proposal.id} [yes/no/no_with_veto/abstain] --chain-id ${chain.chainId} --from [your_key_name]\`\`\``;
	let messageText = `**${chain.name}'s New Proposal!**\n${proposal.title}\n${proposal.description}`;

	// check the message length
	if (messageText.length > 1024) {
		messageText = messageText.substring(0, 1024) + " ...";
	}

	// add proposal information to message
	messageText += `\n\n*Proposal ID*: ${
		proposal.id
	}\n*Submit Time*: ${proposal.submitTime.toUTCString()}\n*Voting Time*: ${proposal.votingStartTime.toUTCString()} - ${proposal.votingEndTime.toUTCString()}\n*How to vote via CLI?*:\n${cliMessage}`;

	if (chain.proposalUrl) {
		const url = chain.proposalUrl.replace("{id}", proposal.id);
		messageText += `\n\n[Proposal Link](${url})`;
	}

	await sendMessageToTelegram(TgChannelId, messageText);
}
