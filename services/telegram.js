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

	// proposal["@type"]の値によって分岐："/cosmos.gov.v1.MsgExecLegacyContent"や、"/cosmos.upgrade.v1beta1.MsgSoftwareUpgrade"がまずある。さらに、 MsgExecLegacyContentの場合は、proposal.content["@type"]の値によって分岐する。
	let messageText = "";
	if (proposal.type === "/cosmos.upgrade.v1beta1.MsgSoftwareUpgrade" || proposal.type === "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal") {
		messageText += `*${chain.name}でソフトウェアアップグレードが提案されました!*\n`;
		messageText += `\n*プロポーザルID*: ${proposal.id}\n`;
		messageText += `*cosmovisorのフォルダ情報*: ${proposal.plan.name}\n`;
		messageText += `*ブロック高*: ${proposal.plan.height}\n`;
		messageText += `*備考*: ${proposal.plan.info}\n`;
	} else if (proposal.type === "/cosmos.params.v1beta1.ParameterChangeProposal") {
		messageText += `*${chain.name}でパラメータの変更が提案されました!*\n`;
		messageText += `${proposal.title}\n${proposal.description}`;
		messageText += `\n*プロポーザルID*: ${proposal.id}\n`;
	} else {
		messageText += `*${chain.name}で新しいプロポーザルが提案されました!*\n`;
		messageText += `${proposal.title}\n${proposal.description}`;
		messageText += `\n*プロポーザルID*: ${proposal.id}\n`;
	}
	messageText += `*提案時間*: ${format(proposal.submitTime, 'yyyy/MM/dd HH:mm')}\n`;
	messageText += `*投票期間*: ${format(proposal.votingStartTime, 'yyyy/MM/dd HH:mm')} - ${format(proposal.votingEndTime, 'yyyy/MM/dd HH:mm')}\n`;
	messageText += `*CLIでの投票方法*:\n${cliMessage}`;
	messageText += `\n[プロポーザルリンク](${chain.proposalUrl.replace("{id}", proposal.id)})`;

	// check the message length
	if (messageText.length > 1024) {
		messageText = messageText.substring(0, 1024) + " ...";
	}

	await sendMessageToTelegram(TgChannelId, messageText);
}
