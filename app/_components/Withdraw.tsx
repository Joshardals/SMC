"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  ArrowLeft,
  Search,
  Wallet,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { useWalletStore } from "@/stores/useWalletStore";

// Contract details
const contractAddress = "0x8322d16518Aadf313b28482a8b37F106306e5f48";
const contractABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_x11",
        type: "address",
      },
    ],
    name: "x10",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_x13",
        type: "address",
      },
    ],
    name: "x12",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_x22",
        type: "address",
      },
      {
        internalType: "address payable",
        name: "_x23",
        type: "address",
      },
    ],
    name: "x21",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "_x25",
        type: "address",
      },
    ],
    name: "x24",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_x9",
        type: "address",
      },
    ],
    name: "x8",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "x14",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "x15",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "x6",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Define the contract interface for TypeScript
interface ContractInterface {
  x21(
    contractAddr: string,
    recipientAddr: string
  ): Promise<ethers.ContractTransactionResponse>;
  x24(recipientAddr: string): Promise<ethers.ContractTransactionResponse>;
  x14(): Promise<string[]>;
  x15(): Promise<string[]>;
}

interface ContractData {
  address: string;
  balance: string;
}

export function Withdraw() {
  const router = useRouter();
  const { address: connectedAddress, isConnected } = useWalletStore();
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<string>("all");
  const [showAddresses, setShowAddresses] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [contractList, setContractList] = useState<ContractData[]>([]);
  const [isLoadingContracts, setIsLoadingContracts] = useState<boolean>(false);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [contract, setContract] = useState<
    (ethers.Contract & ContractInterface) | null
  >(null);

  // Initialize contract when the component mounts
  useEffect(() => {
    const initializeContract = async (): Promise<void> => {
      if (window.ethereum && isConnected) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contractInstance = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          ) as unknown as ethers.Contract & ContractInterface;
          setContract(contractInstance);
        } catch (error) {
          console.error("Error initializing contract:", error);
          setStatusMessage("Failed to initialize contract. Please try again.");
        }
      }
    };

    initializeContract();
  }, [isConnected]);

  // Fetch the list of contracts with balances
  useEffect(() => {
    const fetchContracts = async () => {
      if (!contract) return;

      setIsLoadingContracts(true);
      setStatusMessage("Loading contracts...");

      try {
        // Get all contracts that have a non-zero balance
        const nonZeroBalanceContracts = await contract.x15();

        // For this example, we'll use the fetched contract addresses but simulate balances
        // In a real implementation, you would query each contract's balance
        const contractsWithBalance = await Promise.all(
          nonZeroBalanceContracts.map(async (address) => {
            // In a real app, you would get the actual balance
            // This is a placeholder simulation
            const randomBalance = (Math.random() * 5).toFixed(2);

            return {
              address: address,
              balance: `${randomBalance} ETH`,
            };
          })
        );

        setContractList(contractsWithBalance);
        setStatusMessage("");
      } catch (error) {
        console.error("Error fetching contracts:", error);
        setStatusMessage("Failed to load contracts. Please try again.");
      } finally {
        setIsLoadingContracts(false);
      }
    };

    fetchContracts();
  }, [contract]);

  // Calculate the total balance from all contracts
  const totalBalance = useMemo(() => {
    return contractList
      .reduce((sum, contract) => {
        const balanceValue = parseFloat(contract.balance.split(" ")[0]);
        return sum + (isNaN(balanceValue) ? 0 : balanceValue);
      }, 0)
      .toFixed(2);
  }, [contractList]);

  // Filter contracts based on search query
  const filteredAddresses = useMemo(() => {
    return contractList.filter((contract) =>
      contract.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contractList, searchQuery]);

  // Withdraw from a specific contract
  const withdrawFromSpecificContract = async () => {
    if (!contract || !recipientAddress) {
      setStatusMessage("Please enter a recipient address");
      return;
    }

    if (selectedAddress === "all") {
      setStatusMessage("Please select a specific contract");
      return;
    }

    setIsWithdrawing(true);
    setStatusMessage(
      `Withdrawing from contract ${selectedAddress.slice(
        0,
        6
      )}...${selectedAddress.slice(-4)}...`
    );

    try {
      // Call the withdrawFromContract function (x21)
      const tx = await contract.x21(selectedAddress, recipientAddress);
      await tx.wait();
      setStatusMessage(
        `Successfully withdrawn from contract to ${recipientAddress.slice(
          0,
          6
        )}...${recipientAddress.slice(-4)}`
      );
    } catch (error) {
      console.error("Error withdrawing from contract:", error);
      setStatusMessage(
        "Failed to withdraw. Check your permissions and try again."
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Withdraw from all contracts
  const withdrawFromAllContracts = async () => {
    if (!contract || !recipientAddress) {
      setStatusMessage("Please enter a recipient address");
      return;
    }

    setIsWithdrawing(true);
    setStatusMessage("Withdrawing from all contracts...");

    try {
      // Call the withdrawFromAllContracts function (x24)
      const tx = await contract.x24(recipientAddress);
      await tx.wait();
      setStatusMessage(
        `Successfully withdrawn from all contracts to ${recipientAddress.slice(
          0,
          6
        )}...${recipientAddress.slice(-4)}`
      );
    } catch (error) {
      console.error("Error withdrawing from all contracts:", error);
      setStatusMessage(
        "Failed to withdraw. Check your permissions and try again."
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Handle the withdraw action based on the selected option
  const handleWithdraw = async () => {
    if (selectedAddress === "all") {
      await withdrawFromAllContracts();
    } else {
      await withdrawFromSpecificContract();
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4 flex items-center justify-center">
        <div className="text-white text-center">
          <p>Please connect your wallet to access withdraw features</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      <motion.div
        className="max-w-md mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <button
            title="go back"
            type="button"
            className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-6 h-6 text-gray-400" />
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl text-white font-medium">Withdraw</h1>
          </div>
          <div className="w-10" />
        </div>

        {/* Connected Wallet Display */}
        <motion.div
          className="bg-gray-800/30 backdrop-blur-lg rounded-3xl p-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-3">
            <Wallet className="w-5 h-5 text-green-500" />
            <span className="text-gray-400 text-sm">Connected:</span>
            <span className="text-white text-sm truncate">
              {connectedAddress}
            </span>
          </div>
        </motion.div>

        {/* Status Message Display */}
        {statusMessage && (
          <motion.div
            className={`bg-gray-800/50 backdrop-blur-lg rounded-3xl p-4 mb-6 text-sm ${
              statusMessage.includes("Failed")
                ? "text-red-400"
                : statusMessage.includes("Success")
                ? "text-green-400"
                : "text-gray-300"
            }`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            {statusMessage}
          </motion.div>
        )}

        <div className="space-y-4">
          <div className="mb-4">
            <div className="text-gray-400 mb-2 text-sm">
              Contract to Withdraw From
            </div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={() => setShowAddresses(!showAddresses)}
              className="w-full bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
              disabled={isLoadingContracts || isWithdrawing}
            >
              {isLoadingContracts ? (
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  <span className="text-gray-400">Loading contracts...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col items-start">
                    <span className="text-white font-medium">
                      {selectedAddress === "all"
                        ? "All Contracts"
                        : "Selected Contract"}
                    </span>
                    <span className="text-gray-400 text-sm truncate max-w-[200px]">
                      {selectedAddress === "all"
                        ? `Total: ${totalBalance} ETH`
                        : selectedAddress}
                    </span>
                  </div>
                </div>
              )}
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </motion.button>
          </div>

          <AnimatePresence>
            {showAddresses && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed inset-0 bg-gray-900/95 z-50 overflow-hidden"
              >
                <div className="p-4 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-white">
                      Select Contract
                    </h2>
                    <button
                      onClick={() => setShowAddresses(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      Close
                    </button>
                  </div>

                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search address"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedAddress("all");
                        setShowAddresses(false);
                      }}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors rounded-xl mb-2"
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-white font-medium">
                          All Contracts
                        </span>
                        <span className="text-gray-400 text-sm">
                          {`Total: ${totalBalance} ETH`}
                        </span>
                      </div>
                      {selectedAddress === "all" && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </button>

                    {isLoadingContracts ? (
                      <div className="flex justify-center items-center p-8">
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                        <span className="ml-2 text-gray-400">
                          Loading contracts...
                        </span>
                      </div>
                    ) : filteredAddresses.length === 0 ? (
                      <div className="text-center p-6 text-gray-400">
                        No contracts found
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredAddresses.map((contract) => (
                          <button
                            key={contract.address}
                            onClick={() => {
                              setSelectedAddress(contract.address);
                              setShowAddresses(false);
                            }}
                            className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors rounded-xl"
                          >
                            <div className="flex flex-col items-start">
                              <span className="text-white font-medium truncate max-w-[280px]">
                                {contract.address}
                              </span>
                              <span className="text-gray-400 text-sm">
                                {contract.balance}
                              </span>
                            </div>
                            {selectedAddress === contract.address && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-4 border border-gray-700/50"
          >
            <div className="text-gray-400 text-sm mb-2">Recipient Address</div>
            <input
              type="text"
              className="w-full bg-transparent text-white outline-none"
              placeholder="Enter recipient address"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              disabled={isWithdrawing}
            />
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="button"
            className="w-full bg-blue-600 text-white rounded-xl py-4 mt-8 font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
            onClick={handleWithdraw}
            disabled={!recipientAddress || isWithdrawing || isLoadingContracts}
          >
            {isWithdrawing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Withdrawing...
              </>
            ) : (
              <>
                Withdraw{" "}
                {selectedAddress === "all"
                  ? "from All Contracts"
                  : "from Selected Contract"}
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
