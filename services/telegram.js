import TelegramBot from "node-telegram-bot-api";
import { format } from 'date-fns';
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
	let messageText = `------------------------------\n**${chain.name}で新しいプロポーザルが提案されました!**\n${proposal.title}\n${proposal.description}`;

	// check the message length
	if (messageText.length > 1024) {
		messageText = messageText.substring(0, 1024) + " ...";
	}

	// add proposal information to message
	messageText += `\n\n*プロポーザルID*: ${
		proposal.id
	}\n*提案時間*: ${format(proposal.submitTime, 'yyyy/MM/dd HH:mm')}\n*投票期間*: ${format(proposal.votingStartTime, 'yyyy/MM/dd HH:mm')} - ${format(proposal.votingEndTime, 'yyyy/MM/dd HH:mm')}\n*CLIでの投票方法*:\n${cliMessage}`;

	if (chain.proposalUrl) {
		const url = chain.proposalUrl.replace("{id}", proposal.id);
		messageText += `\n\n[プロポーザルリンク](${url})`;
	}

	await sendMessageToTelegram(TgChannelId, messageText);
}
