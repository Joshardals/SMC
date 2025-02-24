"use client";
import React, { useState, useMemo, useEffect } from "react";
import { ChevronDown, ArrowLeft, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useWalletStore } from "@/stores/useWalletStore";
import { ethers, ContractTransactionResponse } from "ethers";

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

// Define the contract interface
interface ContractInterface {
  x14(): Promise<string[]>; // getAllStorageContracts
  x15(): Promise<string[]>; // getNonZeroBalanceContracts
  x21(
    contractAddress: string,
    recipientAddress: string
  ): Promise<ContractTransactionResponse>; // withdrawFromContract
  x24(recipientAddress: string): Promise<ContractTransactionResponse>; // withdrawFromAllContracts
}

// Interface for contract data with balance
interface ContractData {
  address: string;
  balance: string;
  balanceNumber: number; // For sorting
}

export function Withdraw() {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("all");
  const [showAddresses, setShowAddresses] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { isConnected } = useWalletStore();
  const [contract, setContract] = useState<
    (ethers.Contract & ContractInterface) | null
  >(null);
  const [contractsWithBalance, setContractsWithBalance] = useState<
    ContractData[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize contract
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
          setError("Failed to initialize contract. Please try again.");
        }
      }
    };

    initializeContract();
  }, [isConnected]);

  // Fetch contract data and balances
  useEffect(() => {
    const fetchContractData = async () => {
      if (!contract) return;

      setIsLoading(true);
      try {
        // Get all storage contracts
        const allContractsResult = await contract.x14();

        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);

          // Process all contracts
          const allContractsData: ContractData[] = await Promise.all(
            allContractsResult.map(async (address) => {
              try {
                const balanceWei = await provider.getBalance(address);
                const balanceInBNB = ethers.formatEther(balanceWei);
                const balanceNumber = parseFloat(balanceInBNB);

                return {
                  address,
                  balance: balanceNumber.toFixed(4),
                  balanceNumber,
                };
              } catch (error) {
                console.error(`Error fetching balance for ${address}:`, error);
                return {
                  address,
                  balance: "0.0000",
                  balanceNumber: 0,
                };
              }
            })
          );

          // Filter out zero balance contracts
          const contractsWithNonZeroBalance = allContractsData.filter(
            (contract) => contract.balanceNumber > 0
          );

          setContractsWithBalance(contractsWithNonZeroBalance);
        }
      } catch (error) {
        console.error("Error fetching contract data:", error);
        setError("Failed to fetch contract data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContractData();
  }, [contract]);

  // Calculate total balance
  const totalBalance = useMemo(() => {
    return contractsWithBalance
      .reduce((sum, contract) => sum + contract.balanceNumber, 0)
      .toFixed(4);
  }, [contractsWithBalance]);

  // Filter addresses based on search query
  const filteredAddresses = useMemo(() => {
    return contractsWithBalance.filter((contract) =>
      contract.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contractsWithBalance, searchQuery]);

  // Get the selected contract object
  const selectedContract = useMemo(() => {
    if (selectedAddress === "all") return null;
    return contractsWithBalance.find((c) => c.address === selectedAddress);
  }, [selectedAddress, contractsWithBalance]);

  // Handle withdraw function
  const handleWithdraw = async () => {
    if (!contract || !recipientAddress) {
      setError("Please provide a recipient address");
      return;
    }

    if (!ethers.isAddress(recipientAddress)) {
      setError("Invalid recipient address");
      return;
    }

    setIsWithdrawing(true);
    setError(null);
    setSuccess(null);

    try {
      let tx;

      if (selectedAddress === "all") {
        // Withdraw from all contracts
        tx = await contract.x24(recipientAddress);
      } else {
        // Withdraw from specific contract
        tx = await contract.x21(selectedAddress, recipientAddress);
      }

      await tx.wait();

      setSuccess(
        selectedAddress === "all"
          ? "Successfully withdrew from all contracts!"
          : `Successfully withdrew from contract ${selectedAddress.slice(
              0,
              6
            )}...${selectedAddress.slice(-4)}`
      );

      // Refresh contract data after withdrawal
      const fetchContractData = async () => {
        if (!contract) return;

        try {
          const allContractsResult = await contract.x14();

          if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);

            const allContractsData: ContractData[] = await Promise.all(
              allContractsResult.map(async (address) => {
                try {
                  const balanceWei = await provider.getBalance(address);
                  const balanceInBNB = ethers.formatEther(balanceWei);
                  const balanceNumber = parseFloat(balanceInBNB);

                  return {
                    address,
                    balance: balanceNumber.toFixed(4),
                    balanceNumber,
                  };
                } catch (error) {
                  console.error(
                    `Error fetching balance for ${address}:`,
                    error
                  );
                  return {
                    address,
                    balance: "0.0000",
                    balanceNumber: 0,
                  };
                }
              })
            );

            const contractsWithNonZeroBalance = allContractsData.filter(
              (contract) => contract.balanceNumber > 0
            );

            setContractsWithBalance(contractsWithNonZeroBalance);
          }
        } catch (error) {
          console.error("Error refreshing contract data:", error);
        }
      };

      fetchContractData();
    } catch (error) {
      console.error("Error during withdrawal:", error);
      setError("Transaction failed. Please try again.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4 flex items-center justify-center">
        <div className="text-white text-center">
          <p>Please connect your wallet to use the withdrawal feature</p>
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
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="w-6 h-6 text-gray-400" />
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl text-white font-medium">Withdraw</h1>
          </div>
          <div className="w-10"></div>
        </div>

        <div className="space-y-4">
          <div className="mb-4">
            <div className="text-gray-400 mb-2 text-sm">Contract</div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={() => setShowAddresses(!showAddresses)}
              className="w-full bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
              disabled={isLoading || contractsWithBalance.length === 0}
            >
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col items-start">
                    <span className="text-white font-medium">
                      Loading contracts...
                    </span>
                  </div>
                </div>
              ) : contractsWithBalance.length === 0 ? (
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col items-start">
                    <span className="text-white font-medium">
                      No contracts with balance
                    </span>
                    <span className="text-gray-400 text-sm">
                      Total: 0.0000 BNB
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col items-start">
                    <span className="text-white font-medium">
                      {selectedAddress === "all"
                        ? "All Contracts"
                        : `Contract ${selectedAddress.slice(
                            0,
                            6
                          )}...${selectedAddress.slice(-4)}`}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {selectedAddress === "all"
                        ? `Total: ${totalBalance} BNB`
                        : selectedContract
                        ? `Balance: ${selectedContract.balance} BNB`
                        : "0.0000 BNB"}
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
                          {`Total: ${totalBalance} BNB`}
                        </span>
                      </div>
                      {selectedAddress === "all" && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </button>

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
                            <span className="text-white font-medium">
                              {`${contract.address.slice(
                                0,
                                10
                              )}...${contract.address.slice(-8)}`}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {`${contract.balance} BNB`}
                            </span>
                          </div>
                          {selectedAddress === contract.address && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </button>
                      ))}
                    </div>
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
            />
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-500/20 text-red-400 p-3 rounded-xl"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-green-500/20 text-green-400 p-3 rounded-xl"
            >
              {success}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="button"
            className={`w-full text-white rounded-xl py-4 mt-8 font-medium transition-colors ${
              isWithdrawing ||
              !recipientAddress ||
              contractsWithBalance.length === 0
                ? "bg-blue-600/50 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={handleWithdraw}
            disabled={
              isWithdrawing ||
              !recipientAddress ||
              contractsWithBalance.length === 0
            }
          >
            {isWithdrawing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                <span>Processing...</span>
              </div>
            ) : (
              "Withdraw"
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
