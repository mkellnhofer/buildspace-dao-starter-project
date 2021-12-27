import consts from "./consts.js";
import sdk from "./1-initialize-sdk.js";

const bundleDropModule = sdk.getBundleDropModule(consts.bundleDropModuleAddress);

(async () => {
  try {
    const claimConditionFactory = bundleDropModule.getClaimConditionFactory();
    
    // Specify conditions.
    claimConditionFactory.newClaimPhase({
      startTime: new Date(),
      maxQuantity: 1_000,
      maxQuantityPerTransaction: 1,
    });
    
    await bundleDropModule.setClaimCondition(0, claimConditionFactory);
    console.log("✅ Sucessfully set claim condition on bundle drop, address:",
      bundleDropModule.address);
  } catch (error) {
    console.error("Failed to set claim condition!", error);
  }
})();
