import { useEffect, useState } from "react";
import "./App.css";
import ItemCard from "./components/itemCard";
// import env from "react-dotenv";
// import Web3 from "web3";

function App() {
  const [connectedWalletAddress, setConnectedWalletAddress] = useState("");
  const [beneficiaryAddress, setBeneficiaryAddress] = useState("");
  const [lotteryStage, setLotteryStage] = useState(0);
  const [contractBalance, setContractBalance] = useState(0);

  const [carBidCount, setCarBidCount] = useState(0);
  const [phoneBidCount, setPhoneBidCount] = useState(0);
  const [computerBidCount, setComputerBidCount] = useState(0);

  const [isLotteryDone, setIsLotteryDone] = useState(false);
  const [userWinningItems, setUserWinningItems] = useState([]);
  const [showWinner, setShowWinner] = useState(false);
  const [isDeclareWinnersDisabled, setIsDeclareWinnersDisabled] =
    useState(false);
  const [isWithdrawBalanceDisabled, setIsWithdrawBalanceDisabled] =
    useState(false);
  const [isStartNewCycleDisabled, setIsStartNewCycleDisabled] = useState(false);
  const [isDestroyDisabled, setIsDestroyDisabled] = useState(false);

  const carDetails = {
    name: "Car",
    img_url: require("./images/car.png"),
    bidCount: carBidCount,
  };

  const phoneDetails = {
    name: "Phone",
    img_url: require("./images/phone.png"),
    bidCount: phoneBidCount,
  };

  const computerDetails = {
    name: "Computer",
    img_url: require("./images/computer.png"),
    bidCount: computerBidCount,
  };

  const { Web3 } = require("web3");

  const LotteryContract = require("./smartcontract/contracts/Lottery2.sol/Lottery2.json");
  const LotteryContractAbi = LotteryContract.abi;
  const LOTTERY_ADDRESS = "0xa9D2C8054e75F5F126fF9CF1130963D160D1fD12";

  const connectWallet = async () => {
    if (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined"
    ) {
      try {
        // Request account access if needed
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // Initialize Web3 with the current provider
        const web3 = new Web3(window.ethereum);

        // Get the connected accounts
        const accounts = await web3.eth.getAccounts();
        setConnectedWalletAddress(accounts[0]);
      } catch (err) {
        console.error(err.message);
      }
    } else {
      alert("Please install MetaMask");
    }
  };

  const getOwner = async () => {
    // Initialize Web3 with the current provider
    const web3 = new Web3(window.ethereum);

    let lotteryContract = new web3.eth.Contract(
      LotteryContractAbi,
      LOTTERY_ADDRESS
    );
    lotteryContract.methods.beneficiary().call().then(setBeneficiaryAddress);
  };

  const getBidCounts = async () => {
    // Initialize Web3 with the current provider
    const web3 = new Web3(window.ethereum);

    let lotteryContract = new web3.eth.Contract(
      LotteryContractAbi,
      LOTTERY_ADDRESS
    );
    lotteryContract.methods
      .revealBidCount()
      .call()
      .then(async (cnts) => {
        // console.log(Number(cnts[0]));
        setCarBidCount(Number(cnts[0]));
        setPhoneBidCount(Number(cnts[1]));
        setComputerBidCount(Number(cnts[2]));
      });
  };

  const getLotteryStage = async () => {
    // Initialize Web3 with the current provider
    const web3 = new Web3(window.ethereum);

    let lotteryContract = new web3.eth.Contract(
      LotteryContractAbi,
      LOTTERY_ADDRESS
    );
    lotteryContract.methods
      .stage()
      .call()
      .then(async (st) => {
        // console.log(Number(st));
        setLotteryStage(Number(st));
      });

    if (lotteryStage === 2) {
      setIsLotteryDone(true);
    } else {
      setIsLotteryDone(false);
    }
  };

  const bidOnItem = async (itemId) => {
    const web3 = new Web3(window.ethereum);

    let lotteryContract = new web3.eth.Contract(
      LotteryContractAbi,
      LOTTERY_ADDRESS
    );

    const bidValueInEther = web3.utils.toWei("0.01", "ether");

    try {
      await lotteryContract.methods
        .bid(itemId)
        .send({ from: connectedWalletAddress, value: bidValueInEther });
      console.log("Bid successful");

      // Update bid counts after a successful bid
      const updatedCounts = await lotteryContract.methods
        .revealBidCount()
        .call();

      // Set the updated bid counts in the state
      setCarBidCount(Number(updatedCounts[0]));
      setPhoneBidCount(Number(updatedCounts[1]));
      setComputerBidCount(Number(updatedCounts[2]));
    } catch (error) {
      console.error("Error during bid:", error.message);
    }
  };

  const revealBids = async () => {
    try {
      // Initialize Web3 with the current provider
      const web3 = new Web3(window.ethereum);

      let lotteryContract = new web3.eth.Contract(
        LotteryContractAbi,
        LOTTERY_ADDRESS
      );

      // Call the revealBids method
      const updatedCounts = await lotteryContract.methods
        .revealBidCount()
        .call();

      // Update the bid counts in the state
      setCarBidCount(Number(updatedCounts[0]));
      setPhoneBidCount(Number(updatedCounts[1]));
      setComputerBidCount(Number(updatedCounts[2]));

      console.log("Bids revealed successfully");
    } catch (error) {
      console.error("Error during bid reveal:", error.message);
    }
  };

  const getContractBalance = async () => {
    try {
      // Initialize Web3 with the current provider
      const web3 = new Web3(window.ethereum);

      let lotteryContract = new web3.eth.Contract(
        LotteryContractAbi,
        LOTTERY_ADDRESS
      );

      // Call the balance method of the contract
      const balanceInWei = await web3.eth.getBalance(
        lotteryContract.options.address
      );

      // Convert the balance to Ether
      const balanceInEther = web3.utils.fromWei(balanceInWei, "ether");

      // Update the contract balance in the state
      setContractBalance(Number(balanceInEther));
    } catch (error) {
      console.error("Error fetching contract balance:", error.message);
    }
  };

  const checkIfWinner = async () => {
    try {
    // Ensure that the lottery has been done (stage == 2)
    const web3 = new Web3(window.ethereum);
    let lotteryContract = new web3.eth.Contract(
    LotteryContractAbi,
    LOTTERY_ADDRESS
    );
    const currentStage = Number(await lotteryContract.methods.stage().call());
    
    // console.log("currentStage:", currentStage);
    
    if (currentStage !== 2) {
    // If the lottery is not done, set the winning items to an empty array
    setUserWinningItems([]);
    return;
    }
    
    const currentRound = await lotteryContract.methods.lotteryNum().call();
    
    // Determine the user's winning items
    const winningItems = [];
    
    if (currentStage === 2) {
    const carWinner = await lotteryContract.methods
    .checkWinner(currentRound, 0)
    .call();
    const phoneWinner = await lotteryContract.methods
    .checkWinner(currentRound, 1)
    .call();
    const computerWinner = await lotteryContract.methods
    .checkWinner(currentRound, 2)
    .call();
    
    if (carWinner === connectedWalletAddress) {
    winningItems.push(0);
    }
    if (phoneWinner === connectedWalletAddress) {
    winningItems.push(1);
    }
    if (computerWinner === connectedWalletAddress) {
    winningItems.push(2);
    }
    }
    
    setUserWinningItems(winningItems);
    setShowWinner(true);
    } catch (error) {
    console.error("Error checking if winner:", error.message);
    }
    };

  const declareWinners = async () => {
    const web3 = new Web3(window.ethereum);

    let lotteryContract = new web3.eth.Contract(
      LotteryContractAbi,
      LOTTERY_ADDRESS
    );

    try {
      await lotteryContract.methods
        .declareWinners()
        .send({ from: connectedWalletAddress });
      console.log("Winners declared");

      getLotteryStage();
    } catch (error) {
      console.error("Error during declareWinners:", error.message);
    }
  };

  const withdrawBalance = async () => {
    const web3 = new Web3(window.ethereum);

    let lotteryContract = new web3.eth.Contract(
      LotteryContractAbi,
      LOTTERY_ADDRESS
    );

    try {
      await lotteryContract.methods
        .withdraw()
        .send({ from: connectedWalletAddress });
      console.log("Balance withdrawn");

      getContractBalance();
    } catch (error) {
      console.error("Error during withdraw:", error.message);
    }
  };

  const startNewCycle = async () => {
    const web3 = new Web3(window.ethereum);

    let lotteryContract = new web3.eth.Contract(
      LotteryContractAbi,
      LOTTERY_ADDRESS
    );

    try {
      await lotteryContract.methods
        .startNewCycle()
        .send({ from: connectedWalletAddress });
      console.log("New cycle started");

      getLotteryStage();
      getBidCounts();
    } catch (error) {
      console.error("Error during startNewCycle:", error.message);
    }
  };

  const destroyContract = async () => {
    const web3 = new Web3(window.ethereum);

    let lotteryContract = new web3.eth.Contract(
      LotteryContractAbi,
      LOTTERY_ADDRESS
    );

    try {
      await lotteryContract.methods
        .destroyContract()
        .send({ from: connectedWalletAddress });
      console.log("Contract destroyed");
    } catch (error) {
      console.error("Error during destroyContract:", error.message);
    }
  };

  useEffect(() => {
    getOwner();
    getLotteryStage();
    getBidCounts();
    getContractBalance();
    
    console.log(`Lottery address: ${LOTTERY_ADDRESS}`);
    
    setIsDeclareWinnersDisabled(
    lotteryStage !== 1 || connectedWalletAddress !== beneficiaryAddress
    );
    setIsWithdrawBalanceDisabled(
    lotteryStage !== 2 || connectedWalletAddress !== beneficiaryAddress
    );
    setIsStartNewCycleDisabled(
    lotteryStage !== 2 || connectedWalletAddress !== beneficiaryAddress
    );
    setIsDestroyDisabled(connectedWalletAddress !== beneficiaryAddress);
    
    // Refresh bid counts and contract balance every 30 seconds (adjust the interval as needed)
    const refreshInterval = setInterval(() => {
    getBidCounts();
    getContractBalance();
    getLotteryStage();
    }, 30000);
    
    // Clear the interval when the component is unmounted
    return () => clearInterval(refreshInterval);
    }, [connectedWalletAddress, lotteryStage]); // re-run the effect when connectedWalletAddress or lotteryStage changes

  return (
    <div className="App">
      {connectedWalletAddress ? (
        <div className="content">
          <h1>Lottery - Ballot</h1>
          <div className="prizecontainer">
            <ItemCard
              className="itemcard"
              details={carDetails}
              bidHandler={() => bidOnItem(0)}
              connectedWallet={connectedWalletAddress}
              beneficiaryAddress={beneficiaryAddress}
              lotteryStage={lotteryStage}
            />
            <ItemCard
              className="itemcard"
              details={phoneDetails}
              bidHandler={() => bidOnItem(1)}
              connectedWallet={connectedWalletAddress}
              beneficiaryAddress={beneficiaryAddress}
              lotteryStage={lotteryStage}
            />
            <ItemCard
              className="itemcard"
              details={computerDetails}
              bidHandler={() => bidOnItem(2)}
              connectedWallet={connectedWalletAddress}
              beneficiaryAddress={beneficiaryAddress}
              lotteryStage={lotteryStage}
            />
          </div>
          <div className="actionContainer">
            <div className="userContainer">
              <form action="">
                <label htmlFor="caddr">Current Account</label>
                <input
                  type="text"
                  id="caddr"
                  name="fname"
                  value={connectedWalletAddress}
                />
                <br />
              </form>
              <button className="revealButton" onClick={revealBids}>
                Reveal
              </button>
              <button
                className="winnerButton"
                onClick={checkIfWinner}
                disabled={!isLotteryDone}
              >
                Am I Winner
              </button>
            </div>
            <div className="ownerContainer">
              <form action="">
                <label htmlFor="oaddr">Owner's Account</label>
                <input
                  type="text"
                  id="oaddr"
                  name="fname"
                  value={beneficiaryAddress}
                />
                <br />
              </form>
              <p>Contract Balance: {contractBalance} Ether</p>
              <button
                className="withdrawButton"
                onClick={withdrawBalance}
                disabled={isWithdrawBalanceDisabled}
              >
                Withdraw
              </button>
              <button
                className="declareButton"
                onClick={declareWinners}
                disabled={isDeclareWinnersDisabled}
              >
                Declare Winner
              </button>
              <button
                className="newCycleButton"
                onClick={startNewCycle}
                disabled={isStartNewCycleDisabled}
              >
                StartNewCycle
              </button>
              <button
                className="destroyButton"
                onClick={destroyContract}
                disabled={isDestroyDisabled}
              >
                Destroy Contract
              </button>
            </div>
          </div>
          {showWinner && userWinningItems.length > 0 && (
            <p>You won items: {userWinningItems.join(", ")}</p>
          )}
          {showWinner && userWinningItems.length === 0 && (
            <p>You didn't win any items</p>
          )}
        </div>
      ) : (
        <div className="connectWalletContainer">
          <button className="walletConnectBtn" onClick={connectWallet}>
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
