import { ethers } from "ethers";

import consts from "./consts.js";
import sdk from "./sdk.js";

const tokenModule = sdk.getTokenModule(consts.tokenModuleAddress);

(async () => {
  try {
    // What's the max supply you want to set? 1,000,000 is a nice number!
    const amount = 100_000;
    // We use the util function from "ethers" to convert the amount
    // to have 18 decimals (which is the standard for ERC20 tokens).
    const amountWith18Decimals = ethers.utils.parseUnits(amount.toString(), 18);
    // Interact with your deployed ERC-20 contract and mint the tokens!
    await tokenModule.mint(amountWith18Decimals);
    const totalSupply = await tokenModule.totalSupply();
    
    // Print out how many of our token's are out there now!
    console.log("✅ There now is", ethers.utils.formatUnits(totalSupply, 18),
      "$PUPPIX in circulation");
  } catch (error) {
    console.error("Failed to print money!", error);
  }
})();
