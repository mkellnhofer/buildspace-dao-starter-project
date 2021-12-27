import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { useWeb3 } from "@3rdweb/hooks";

import consts from "./consts.js";
import "./App.css";

// We instatiate the sdk on Rinkeby.
const sdk = new ThirdwebSDK("rinkeby");

// Get a reference to our ERC-1155 contract.
const bundleDropModule = sdk.getBundleDropModule(consts.bundleDropModuleAddress);

// Get a reference to our ERC-20 contract.
const tokenModule = sdk.getTokenModule(consts.tokenModuleAddress);

// Get a reference to our governance contract.
const voteModule = sdk.getVoteModule(consts.voteModuleAddress);

const App = () => {
  // Use the connectWallet hook thirdweb gives us.
  const { connectWallet, address, provider } = useWeb3();
  console.log("👋 Address:", address);

  // The signer is required to sign transactions on the blockchain.
  // Without it we can only read data, not write.
  const signer = provider ? provider.getSigner() : undefined;

  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [memberAddresses, setMemberAddresses] = useState([]);
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

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

  // Grab all addresses of our members holding our NFT.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    
    // Grab the users who hold our NFT with tokenId 0.
    bundleDropModule
      .getAllClaimerAddresses("0")
      .then((addresess) => {
        console.log("🚀 Members addresses:", addresess)
        setMemberAddresses(addresess);
      })
      .catch((err) => {
        console.error("Failed to get member list!", err);
      });
  }, [hasClaimedNFT]);

  // Grab the # of token each member holds.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // Grab all the balances.
    tokenModule
      .getAllHolderBalances()
      .then((amounts) => {
        console.log("👜 Amounts:", amounts)
        setMemberTokenAmounts(amounts);
      })
      .catch((err) => {
        console.error("Failed to get token amounts!", err);
      });
  }, [hasClaimedNFT]);

  // Retrieve all our existing proposals from the contract.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    // A simple call to voteModule.getAll() to grab the proposals.
    voteModule
      .getAll()
      .then((proposals) => {
        // Set state!
        setProposals(proposals);
        console.log("🌈 Proposals:", proposals)
      })
      .catch((err) => {
        console.error("Failed to get proposals!", err);
      });
  }, [hasClaimedNFT]);

  // Check if the user already voted.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // If we haven't finished retrieving the proposals from the useEffect above then we can't check
    // if the user voted yet!
    if (!proposals.length) {
      return;
    }

    // Check if the user has already voted on the first proposal.
    voteModule
      .hasVoted(proposals[0].proposalId, address)
      .then((hasVoted) => {
        setHasVoted(hasVoted);
        if (hasVoted) {
          console.log("🥵 User has already voted.")
        }
      })
      .catch((err) => {
        console.error("Failed to check if wallet has voted!", err);
      });
  }, [hasClaimedNFT, proposals, address]);
  
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

  // A fancy function to shorten someones wallet address, no need to show the whole thing. 
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  // Now, we combine the memberAddresses and memberTokenAmounts into a single array.
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          // If the address isn't in memberTokenAmounts, it means they don't hold any of our token.
          memberTokenAmounts[address] || 0,
          18,
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

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
      <div>
        <div>
          <h2>Member List</h2>
          <table className="card">
            <thead>
              <tr>
                <th>Address</th>
                <th>Token Amount</th>
              </tr>
            </thead>
            <tbody>
              {memberList.map((member) => {
                return (
                  <tr key={member.address}>
                    <td>{shortenAddress(member.address)}</td>
                    <td>{member.tokenAmount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div>
          <h2>Active Proposals</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              e.stopPropagation();

              // Before we do async things, we want to disable the button to prevent double clicks.
              setIsVoting(true);

              // Lets get the votes from the form for the values.
              const votes = proposals.map((proposal) => {
                let voteResult = {
                  proposalId: proposal.proposalId,
                  // Abstain by default.
                  vote: 2,
                };
                proposal.votes.forEach((vote) => {
                  const elem = document.getElementById(
                    proposal.proposalId + "-" + vote.type
                  );

                  if (elem.checked) {
                    voteResult.vote = vote.type;
                    return;
                  }
                });
                return voteResult;
              });

              // First we need to make sure the user delegates their token to vote.
              try {
                // We'll check if the wallet still needs to delegate their tokens before they can
                // vote.
                const delegation = await tokenModule.getDelegationOf(address);
                // If the delegation is the 0x0 address that means they have not delegated their
                // governance tokens yet.
                if (delegation === ethers.constants.AddressZero) {
                  // If they haven't delegated their tokens yet, we'll have them delegate them
                  // before voting.
                  await tokenModule.delegateTo(address);
                }
                // Then we need to vote on the proposals.
                try {
                  await Promise.all(
                    votes.map(async (vote) => {
                      // Before voting we first need to check whether the proposal is open for
                      // voting. We first need to get the latest state of the proposal.
                      const proposal = await voteModule.get(vote.proposalId);
                      // Then we check if the proposal is open for voting
                      // (state === 1 means it is open)
                      if (proposal.state === 1) {
                        // If it is open for voting, we'll vote on it.
                        return voteModule.vote(vote.proposalId, vote.vote);
                      }
                      // If the proposal is not open for voting we just return nothing, letting us
                      // continue.
                      return;
                    })
                  );
                  try {
                    // If any of the propsals are ready to be executed we'll need to execute them
                    // a proposal is ready to be executed if it is in state 4.
                    await Promise.all(
                      votes.map(async (vote) => {
                        // We'll first get the latest state of the proposal again, since we may have
                        // just voted before.
                        const proposal = await voteModule.get(
                          vote.proposalId
                        );

                        // If the state is in state 4 (meaning that it is ready to be executed),
                        // we'll execute the proposal.
                        if (proposal.state === 4) {
                          return voteModule.execute(vote.proposalId);
                        }
                      })
                    );
                    // If we get here that means we successfully voted, so let's set the "hasVoted"
                    // state to true.
                    setHasVoted(true);
                    console.log("Successfully voted.");
                  } catch (err) {
                    console.error("Failed to execute votes!", err);
                  }
                } catch (err) {
                  console.error("Failed to vote!.", err);
                }
              } catch (err) {
                console.error("Failed to delegate tokens!");
              } finally {
                // In *either* case we need to set the isVoting state to false to enable the button
                // again.
                setIsVoting(false);
              }
            }}
          >
            {proposals.map((proposal, index) => (
              <div key={proposal.proposalId} className="card">
                <h5>{proposal.description}</h5>
                <div>
                  {proposal.votes.map((vote) => (
                    <div key={vote.type}>
                      <input
                        type="radio"
                        id={proposal.proposalId + "-" + vote.type}
                        name={proposal.proposalId}
                        value={vote.type}
                        // Set default to "abstain".
                        defaultChecked={vote.type === 2}
                      />
                      <label htmlFor={proposal.proposalId + "-" + vote.type}>{vote.label}</label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button disabled={isVoting || hasVoted} type="submit">
              {isVoting ? "Voting..." : hasVoted ? "You Already Voted" : "Submit Votes"}
            </button>
            <small>This will trigger multiple transactions that you will need to sign.</small>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
