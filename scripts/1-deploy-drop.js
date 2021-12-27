import { ethers } from "ethers";
import { readFileSync } from "fs";

import consts from "./consts.js";
import sdk from "./sdk.js";

const app = sdk.getAppModule(consts.appAddress);

(async () => {
  try {
    const bundleDropModule = await app.deployBundleDropModule({
      // The collection's name, ex. CryptoPunks
      name: "PuppyPixDAO Membership",
      // A description for the collection.
      description: "A DAO for fans of puppy pictures.",
      // The image for the collection that will show up on OpenSea.
      image: readFileSync("scripts/assets/puppy-pix.jpg"),
      // We need to pass in the address of the person who will be receiving the proceeds from sales
      // of nfts in the module. We're planning on not charging people for the drop, so we'll pass 
      // in the 0x0 address you can set this to your own wallet address if you want to charge for
      // the drop.
      primarySaleRecipientAddress: ethers.constants.AddressZero,
    });
    
    console.log("✅ Successfully deployed bundle drop module, address:", bundleDropModule.address);
    console.log("✅ Bundle drop metadata:", await bundleDropModule.getMetadata());
  } catch (error) {
    console.log("Failed to deploy bundle drop module!", error);
  }
})();
