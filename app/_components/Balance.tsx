"use client";
import { useState, useEffect } from "react";
import { RotateCw } from "lucide-react";
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

// Define the contract interface
interface ContractInterface {
  x14(): Promise<string[]>; // getAllStorageContracts
  x15(): Promise<string[]>; // getNonZeroBalanceContracts
}

export function Balance() {
  const [showUSD, setShowUSD] = useState(false);
  const [bnbPrice, setBnbPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalBalance, setTotalBalance] = useState("0.00");
  const [refreshing, setRefreshing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const { isConnected } = useWalletStore();

  // Function to fetch BNB price
  const fetchBnbPrice = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd"
      );
      if (!response.ok) throw new Error("Failed to fetch BNB price");
      const data = await response.json();
      console.log("BNB Price data:", data);
      setBnbPrice(data.binancecoin.usd);
    } catch (err) {
      console.error("BNB Price fetch error:", err);
      setError("Failed to load price");
    }
  };

  // Function to fetch contract balances
  const fetchContractBalances = async () => {
    if (!window.ethereum || !isConnected) {
      setTotalBalance("0.00");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      ) as unknown as ethers.Contract & ContractInterface;

      // Get all storage contracts
      const allContractsResult = await contract.x14();
      console.log("Retrieved contracts:", allContractsResult);

      if (!allContractsResult || allContractsResult.length === 0) {
        console.log("No contracts returned from x14()");
        setTotalBalance("0.00");
        return;
      }

      // Use Promise.all for better performance when fetching balances
      const balancePromises = allContractsResult.map(async (address) => {
        try {
          const balanceWei = await provider.getBalance(address);
          const balanceInBNB = parseFloat(ethers.formatEther(balanceWei));
          console.log(`Address ${address}: ${balanceInBNB} BNB`);
          return balanceInBNB;
        } catch (e) {
          console.error(`Error getting balance for ${address}:`, e);
          return 0;
        }
      });

      const balances = await Promise.all(balancePromises);
      
      // Calculate total
      const total = balances.reduce((sum, balance) => sum + balance, 0);
      
      console.log("Individual balances:", balances);
      console.log("Total balance calculated:", total);
      
      setTotalBalance(total.toFixed(8));
      
      // Set some debug info
      setDebugInfo(`Found ${allContractsResult.length} contracts with a total of ${total.toFixed(8)} BNB`);
    } catch (err) {
      console.error("Error fetching contract balances:", err);
      setError("Failed to load balances");
      setDebugInfo(err instanceof Error ? err.message : String(err));
    }
  };

  // Refresh all data sequentially to avoid race conditions
  const refreshAll = async () => {
    setRefreshing(true);
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      // Fetch price first
      await fetchBnbPrice();
      // Then fetch balances
      await fetchContractBalances();
    } catch (err) {
      console.error("Refresh error:", err);
      setError("Refresh failed");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (isConnected) {
      refreshAll();
    }
  }, [isConnected]);

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatBNB = (value: string) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(parseFloat(value));
  };

  const amountNumber = parseFloat(totalBalance);
  const usdAmount = bnbPrice ? formatUSD(amountNumber * bnbPrice) : "$0.00";
  const formattedBNB = formatBNB(totalBalance);

  return (
    <div className="flex flex-col justify-between items-center mb-6 px-4">
      <div>
        <h2 className="text-gray-400 text-sm mb-1">Total Balance</h2>
        <button
          onClick={() => setShowUSD(!showUSD)}
          className="flex items-center group hover:opacity-80 transition-opacity"
          disabled={isLoading || !!error}
        >
          <h1 className="text-2xl font-bold text-white">
            {showUSD ? usdAmount : formattedBNB}
          </h1>
          <span className="text-gray-400 text-lg ml-1">
            {showUSD ? "" : "BNB"}
          </span>
          {!isLoading && !error && (
            <span className="text-xs text-gray-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Click to toggle
            </span>
          )}
          {isLoading && (
            <span className="text-xs text-gray-500 ml-2">Loading...</span>
          )}
          {error && <span className="text-xs text-red-500 ml-2">{error}</span>}
        </button>
        {!isLoading && !error && bnbPrice && (
          <p className="text-xs text-gray-500 mt-1">
            1 BNB = {formatUSD(bnbPrice)}
          </p>
        )}
        {debugInfo && (
          <p className="text-xs text-blue-400 mt-1 bg-blue-900/20 p-1 rounded">
            {debugInfo}
          </p>
        )}
      </div>
      <div className="mt-3 flex items-center justify-center">
        <button
          title="refresh balance"
          className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors"
          onClick={refreshAll}
          disabled={refreshing}
        >
          <RotateCw
            className={`w-5 h-5 text-gray-400 ${
              refreshing ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}