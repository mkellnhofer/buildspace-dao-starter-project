import { useEffect, useState } from "react";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { useWeb3 } from "@3rdweb/hooks";

import consts from "./consts.js";
import "./App.css";

// We instatiate the sdk on Rinkeby.
const sdk = new ThirdwebSDK("rinkeby");

// Get a reference to our ERC-1155 contract.
const bundleDropModule = sdk.getBundleDropModule(consts.bundleDropModuleAddress);

const App = () => {
  // Use the connectWallet hook thirdweb gives us.
  const { connectWallet, address, provider } = useWeb3();
  console.log("👋 Address:", address);

  // The signer is required to sign transactions on the blockchain.
  // Without it we can only read data, not write.
  const signer = provider ? provider.getSigner() : undefined;

  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    // We pass the signer to the sdk, which enables us to interact with our deployed contract!
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  useEffect(() => {
    // If they don't have an connected wallet, exit!
    if (!address) {
      return;
    }
    
    // Check if the user has the NFT by using bundleDropModule.balanceOf
    return bundleDropModule
      .balanceOf(address, "0")
      .then((balance) => {
        // If balance is greater than 0, they have our NFT!
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("🌟 This user has a membership NFT!")
        } else {
          setHasClaimedNFT(false);
          console.log("😭 This user doesn't have a membership NFT.")
        }
      })
      .catch((error) => {
        setHasClaimedNFT(false);
        console.error("Failed to get NFT balance!", error);
      });
  }, [address]);

  // If user hasn't connected their wallet: Show connect wallet button
  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to PuppyPixDAO</h1>
        <button onClick={() => connectWallet("injected")} className="btn-hero">
          Connect your wallet
        </button>
      </div>
    );
  }
  
  const mintNft = () => {
    setIsClaiming(true);
    // Call bundleDropModule.claim("0", 1) to mint nft to user's wallet.
    bundleDropModule
    .claim("0", 1)
    .catch((err) => {
      console.error("Failed to claim!", err);
      setIsClaiming(false);
    })
    .finally(() => {
      // Stop loading state.
      setIsClaiming(false);
      // Set claim state.
      setHasClaimedNFT(true);
      // Show user their fancy new NFT!
      console.log(`🌊 Successfully Minted! Check it out on OpenSea: ` +
        `https://testnets.opensea.io/assets/${bundleDropModule.address}/0`);
    });
  }

  // If user hasn't minted membership NFT: Show mint NFT button
  if (!hasClaimedNFT) {
    return (
      <div className="mint-nft">
        <h1>Mint your free DAO Membership NFT</h1>
        <button
          disabled={isClaiming}
          onClick={() => mintNft()}
        >
          {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
        </button>
      </div>
    );
  };

  // Show membership page.
  return (
    <div className="member-page">
      <h1>DAO Member Page</h1>
      <p>Congratulations on being a member</p>
    </div>
  );
};

export default App;
