import { readFileSync } from "fs";

import consts from "./consts.js";
import sdk from "./sdk.js";

const bundleDropModule = sdk.getBundleDropModule(consts.bundleDropModuleAddress);

(async () => {
  try {
    await bundleDropModule.createBatch([
      {
        name: "Puppy Pictures Viewer",
        description: "This NFT will give you access to PuppyPixDAO!",
        image: readFileSync("scripts/assets/puppy-pix-viewer.png"),
      },
    ]);
    console.log("✅ Successfully created a new NFT.");
  } catch (error) {
    console.error("Failed to create the new NFT!", error);
  }
})();
