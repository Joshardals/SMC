"use client";
import React, { useState, useEffect } from "react";
import {
  FileCode2,
  History,
  ChevronRight,
  ArrowLeft,
  ArrowUpDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useWalletStore } from "@/stores/useWalletStore";
import { ethers } from "ethers";

// Contract details (same as in Admin component)
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
  x14(): Promise<string[]>; // getAllStorageContracts
  x15(): Promise<string[]>; // getNonZeroBalanceContracts
}

// Contract detail component
const ContractItem = ({ address, type }: { address: string; type: string }) => {
  const [balance, setBalance] = useState<string>("0");
  const [timestamp, setTimestamp] = useState<string>("now");

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const balanceWei = await provider.getBalance(address);
          const balanceEth = ethers.formatEther(balanceWei);
          setBalance(parseFloat(balanceEth).toFixed(4));
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    // Mock timestamp for now (in real app, would fetch from blockchain or backend)
    setTimestamp(Math.floor(Math.random() * 5) + 1 + "h ago");

    fetchBalance();
  }, [address]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700/50"
    >
      <div className="flex flex-col">
        <span className="text-white text-sm">{type}</span>
        <span className="text-gray-400 text-xs">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
      </div>
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className="text-blue-400 text-sm">{balance} ETH</div>
          <div className="text-gray-500 text-xs">{timestamp}</div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-500" />
      </div>
    </motion.div>
  );
};

export function Addresses() {
  const [selectedView, setSelectedView] = useState("basic");
  const [sortDesc, setSortDesc] = useState(true);
  const router = useRouter();
  const { isConnected } = useWalletStore();
  const [allContracts, setAllContracts] = useState<string[]>([]);
  const [nonZeroBalanceContracts, setNonZeroBalanceContracts] = useState<
    string[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [contract, setContract] = useState<
    (ethers.Contract & ContractInterface) | null
  >(null);

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

  // Fetch contract data
  useEffect(() => {
    const fetchContractData = async () => {
      if (!contract) return;

      setIsLoading(true);
      try {
        // Get all storage contracts (x14)
        const allContractsResult = await contract.x14();
        setAllContracts(allContractsResult);

        // Get non-zero balance contracts (x15)
        const nonZeroBalanceResult = await contract.x15();
        setNonZeroBalanceContracts(nonZeroBalanceResult);
      } catch (error) {
        console.error("Error fetching contract data:", error);
        setError("Failed to fetch contract data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContractData();
  }, [contract]);

  // Get the display contracts based on selected view
  const displayContracts =
    selectedView === "basic" ? allContracts : nonZeroBalanceContracts;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4 flex items-center justify-center">
        <div className="text-white text-center">
          <p>Please connect your wallet to view addresses</p>
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
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
          <h1 className="text-xl text-white font-medium">Addresses</h1>
          <div className="w-10" />
        </div>

        <motion.div
          className="bg-gray-800/30 backdrop-blur-lg rounded-3xl p-6 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-500/20 p-4 rounded-full mb-4">
              <FileCode2 className="w-8 h-8 text-blue-500" />
            </div>
            {isLoading ? (
              <div className="text-3xl font-bold text-white mb-2">...</div>
            ) : (
              <div className="text-3xl font-bold text-white mb-2">
                {allContracts.length}
              </div>
            )}
            <div className="text-gray-400 text-sm mb-6">Total Contracts</div>

            <div className="flex w-full gap-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedView("basic")}
                className={`flex-1 py-3 px-4 rounded-xl transition-all ${
                  selectedView === "basic"
                    ? "bg-blue-600 text-white"
                    : "border border-blue-600/30 text-blue-400"
                }`}
              >
                Contract
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedView("balance")}
                className={`flex-1 py-3 px-4 rounded-xl transition-all ${
                  selectedView === "balance"
                    ? "bg-blue-600 text-white"
                    : "border border-blue-600/30 text-blue-400"
                }`}
              >
                Contract with Balance
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="bg-gray-800/30 backdrop-blur-lg rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">Contracts</span>
            </div>
            <button
              onClick={() => setSortDesc(!sortDesc)}
              className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="text-sm">{sortDesc ? "Highest" : "Lowest"}</span>
            </button>
          </div>

          {error && (
            <div className="text-red-400 mb-4 p-3 bg-red-900/20 rounded-xl">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : displayContracts.length > 0 ? (
            <div className="space-y-4">
              {displayContracts.map((address, index) => (
                <ContractItem
                  key={address + index}
                  address={address}
                  type={
                    selectedView === "basic"
                      ? "Contract Created"
                      : "Contract with Balance"
                  }
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-gray-600 mb-2">
                <History className="w-12 h-12 opacity-50" />
              </div>
              <div className="text-gray-500 text-sm">No contracts found</div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
