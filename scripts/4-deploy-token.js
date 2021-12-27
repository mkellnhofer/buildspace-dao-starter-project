import consts from "./consts.js";
import sdk from "./sdk.js";

const app = sdk.getAppModule(consts.appAddress);

(async () => {
  try {
    // Deploy a standard ERC-20 contract.
    const tokenModule = await app.deployTokenModule({
      // What's your token's name? Ex. "Ethereum"
      name: "PuppyPixDAO Governance Token",
      // What's your token's symbol? Ex. "ETH"
      symbol: "PUPPIX",
    });
    console.log("✅ Successfully deployed token module, address:", tokenModule.address);
  } catch (error) {
    console.error("Failed to deploy token module!", error);
  }
})();
