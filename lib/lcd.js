import axios from "axios";
import pRetry from "p-retry";

export default class LcdClient {
	constructor(url) {
		this.url = url;
	}

	async getProposalsV1beta1() {
		const response = await this.request(
			"/cosmos/gov/v1beta1/proposals?pagination.reverse=true"
		);
		const filteredProposals = response.data.proposals.filter(
			(proposal) => proposal.status === "PROPOSAL_STATUS_VOTING_PERIOD"
		);
		return filteredProposals.map((proposal) => ({
			id: parseInt(proposal.proposal_id),
			type: proposal?.content?.["@type"],
			title: proposal?.content?.title,
			description: proposal?.content?.description,
			status: proposal.status,
			plan: proposal?.content?.plan,
			submitTime: new Date(proposal.submit_time),
			votingStartTime: new Date(proposal.voting_start_time),
			votingEndTime: new Date(proposal.voting_end_time),
		}));
	}

	async getProposalsV1() {
		const response = await this.request(
			"/cosmos/gov/v1/proposals?pagination.reverse=true"
		);
		const filteredProposals = response.data.proposals.filter(
			(proposal) => proposal.status === "PROPOSAL_STATUS_VOTING_PERIOD"
		);
		return filteredProposals.map((proposal) => ({
			id: parseInt(proposal.id),
			type: proposal?.messages[0]?.content?.["@type"] || proposal?.messages[0]?.["@type"],
			title: proposal?.messages[0]?.title,
			description: proposal?.messages[0]?.description,
			status: proposal.status,
			plan: proposal?.content?.plan || proposal?.messages[0]?.plan,
			submitTime: new Date(proposal.submit_time),
			votingStartTime: new Date(proposal.voting_start_time),
			votingEndTime: new Date(proposal.voting_end_time),
		}));
	}

	async request(path) {
		const url = this.url + path;
		return await pRetry(() => axios.get(url), {
			retries: 5,
			onFailedAttempt: (error) => {
				console.log(
					`${url} Request failed.  ${error.retriesLeft} retries left`
				);
			},
		});
	}
}
