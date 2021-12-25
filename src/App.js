import { useWeb3 } from "@3rdweb/hooks";

import "./App.css";

const App = () => {
  // Use the connectWallet hook thirdweb gives us.
  const { connectWallet, address } = useWeb3();
  console.log("👋 Address:", address);

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

  // Show success message.
  return (
    <div className="landing">
      <h1>👀 Wallet connected, now what?</h1>
    </div>);
};

export default App;
