import { ethers } from "ethers";

import consts from "./consts.js";
import sdk from "./sdk.js";

// This is our ERC-20 contract.
const tokenModule = sdk.getTokenModule(consts.tokenModuleAddress);

// This is our governance contract.
const voteModule = sdk.getVoteModule(consts.voteModuleAddress);

(async () => {
  try {
    // Give our treasury the power to mint additional token if needed.
    await tokenModule.grantRole("minter", voteModule.address);

    console.log("✅ Successfully gave vote module permissions to act on token module.");
  } catch (error) {
    console.error("Failed to grant vote module permissions on token module!", error);
    process.exit(1);
  }

  try {
    // Grab our wallet's token balance, remember -- we hold basically the entire supply right now!
    const ownedTokenBalance = await tokenModule.balanceOf(process.env.WALLET_ADDRESS);

    // Grab 90% of the supply that we hold.
    const ownedAmount = ethers.BigNumber.from(ownedTokenBalance.value);
    const percent90 = ownedAmount.div(100).mul(90);

    // Transfer 90% of the supply to our voting contract.
    await tokenModule.transfer(voteModule.address, percent90);

    console.log("✅ Successfully transferred tokens to vote module.");
  } catch (err) {
    console.error("Failed to transfer tokens to vote module!", err);
  }
})();
