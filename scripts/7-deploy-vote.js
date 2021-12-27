import consts from "./consts.js";
import sdk from "./sdk.js";

const app = sdk.getAppModule(consts.appAddress);

(async () => {
  try {
    const voteModule = await app.deployVoteModule({
      // Give your governance contract a name.
      name: "PuppyPixDAO's Epic Proposals",

      // This is the location of our governance token, our ERC-20 contract!
      votingTokenAddress: consts.tokenModuleAddress,

      // After a proposal is created, when can members start voting? For now, we set this to
      // immediately.
      proposalStartWaitTimeInSeconds: 0,

      // How long do members have to vote on a proposal when it's created? Here, we set it to 24
      // hours (86400 seconds)
      proposalVotingTimeInSeconds: 24 * 60 * 60,

      // Will explain more below.
      votingQuorumFraction: 0,

      // What's the minimum # of tokens a user needs to be allowed to create a proposal? I set it
      // to 0. Meaning no tokens are required for a user to be allowed to create a proposal.
      minimumNumberOfTokensNeededToPropose: "0",
    });

    console.log("✅ Successfully deployed vote module, address:", voteModule.address);
  } catch (err) {
    console.error("Failed to deploy vote module!", err);
  }
})();
