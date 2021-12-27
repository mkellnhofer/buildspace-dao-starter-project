import { ThirdwebSDK } from "@3rdweb/sdk";
import dotenv from "dotenv";
import ethers from "ethers";

// Load config values from our .env file that we use to securely store our environment variables.
dotenv.config();

// Some quick checks to make sure our .env file values are set.
if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === "") {
  console.log("🛑 Private key not found!")
}

if (!process.env.ALCHEMY_API_URL || process.env.ALCHEMY_API_URL === "") {
  console.log("🛑 Alchemy API URL not found!")
}

if (!process.env.WALLET_ADDRESS || process.env.WALLET_ADDRESS === "") {
  console.log("🛑 Wallet address not found!")
}

const sdk = new ThirdwebSDK(
  new ethers.Wallet(
    // Your wallet private key.
    // (ALWAYS KEEP THIS PRIVATE, DO NOT SHARE IT WITH ANYONE, add it to your .env file and do not
    // commit that file to Github!)
    process.env.PRIVATE_KEY,
    // RPC URL, we'll use our Alchemy API URL from our .env file.
    ethers.getDefaultProvider(process.env.ALCHEMY_API_URL),
  ),
);

(async () => {
  try {
    const apps = await sdk.getApps();
    console.log("Your app address is:", apps[0].address);
  } catch (err) {
    console.error("Failed to get apps from the SDK!", err);
    process.exit(1);
  }
})()

// We are exporting the initialized thirdweb SDK so that we can use it in our other scripts
export default sdk;