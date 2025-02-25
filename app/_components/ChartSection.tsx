"use client";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ethers } from "ethers";
import { useWalletStore } from "@/stores/useWalletStore";

// Contract details - duplicated here since ChartSection is separate
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
];

// Define the contract interface
interface ContractInterface {
  x14(): Promise<string[]>; // getAllStorageContracts
  x15(): Promise<string[]>; // getNonZeroBalanceContracts
}

// Time periods in milliseconds
const TIME_PERIODS = {
  "1D": 24 * 60 * 60 * 1000,
  "1W": 7 * 24 * 60 * 60 * 1000,
  "1M": 30 * 24 * 60 * 60 * 1000,
  "1Y": 365 * 24 * 60 * 60 * 1000,
  ALL: Infinity,
};

const TimeFilter = ({
  active,
  onClick,
}: {
  active: string;
  onClick: (period: string) => void;
}) => {
  const periods = ["1D", "1W", "1M", "1Y", "ALL"];
  return (
    <div className="flex justify-center gap-4 mt-4">
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onClick(period)}
          className={`px-3 py-1 rounded-lg text-sm ${
            active === period
              ? "bg-gray-700 text-white"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          {period}
        </button>
      ))}
    </div>
  );
};

export function ChartSection() {
  const [activePeriod, setActivePeriod] = useState("ALL");
  const [currentBalance, setCurrentBalance] = useState(0);
  const [balanceHistory, setBalanceHistory] = useState<
    Array<{ time: number; value: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isConnected } = useWalletStore();

  // Function to fetch contract balances
  const fetchContractBalances = async () => {
    if (!window.ethereum || !isConnected) {
      setCurrentBalance(0);
      return;
    }

    setIsLoading(true);
    setError(null);

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

      if (!allContractsResult || allContractsResult.length === 0) {
        console.log("No contracts returned from x14()");
        setCurrentBalance(0);
        return;
      }

      // Use Promise.all for better performance when fetching balances
      const balancePromises = allContractsResult.map(async (address) => {
        try {
          const balanceWei = await provider.getBalance(address);
          const balanceInBNB = parseFloat(ethers.formatEther(balanceWei));
          return balanceInBNB;
        } catch (e) {
          console.error(`Error getting balance for ${address}:`, e);
          return 0;
        }
      });

      const balances = await Promise.all(balancePromises);

      // Calculate total
      const total = balances.reduce((sum, balance) => sum + balance, 0);
      setCurrentBalance(total);

      // Add to history
      const currentTime = Date.now();
      updateBalanceHistory(total, currentTime);
    } catch (err) {
      console.error("Error fetching contract balances:", err);
      setError("Failed to load balances");
    } finally {
      setIsLoading(false);
    }
  };

  // Load historical data from localStorage
  useEffect(() => {
    if (isConnected) {
      try {
        const storedHistory = localStorage.getItem("bnbBalanceHistory");
        if (storedHistory) {
          setBalanceHistory(JSON.parse(storedHistory));
        }
      } catch (err) {
        console.error("Failed to load balance history:", err);
      }

      // Fetch current balance immediately
      fetchContractBalances();
    }
  }, [isConnected]);

  // Set up periodic polling
  useEffect(() => {
    if (isConnected) {
      // Fetch data every 5 minutes
      const intervalId = setInterval(() => {
        fetchContractBalances();
      }, 5 * 60 * 1000);

      return () => clearInterval(intervalId);
    }
  }, [isConnected]);

  // Update balance history
  const updateBalanceHistory = (newBalance: number, timestamp: number) => {
    setBalanceHistory((prevHistory) => {
      const newHistory = [...prevHistory];

      // Only add a new entry if value changed or it's been more than 1 hour
      const lastEntry = newHistory[newHistory.length - 1];
      if (
        !lastEntry ||
        Math.abs(lastEntry.value - newBalance) > 0.00001 ||
        timestamp - lastEntry.time > 60 * 60 * 1000
      ) {
        newHistory.push({
          time: timestamp,
          value: newBalance,
        });

        // Limit history to 1000 points to prevent localStorage issues
        if (newHistory.length > 1000) {
          newHistory.shift();
        }

        // Save to localStorage
        try {
          localStorage.setItem("bnbBalanceHistory", JSON.stringify(newHistory));
        } catch (err) {
          console.error("Failed to save balance history:", err);
        }
      }

      return newHistory;
    });
  };

  // Filter data based on selected time period
  const getFilteredData = () => {
    if (balanceHistory.length === 0) return [];

    const cutoffTime =
      Date.now() - TIME_PERIODS[activePeriod as keyof typeof TIME_PERIODS];
    const filtered = balanceHistory.filter((item) => item.time >= cutoffTime);

    // Format data for display
    return filtered.map((item) => ({
      time: new Date(item.time).toLocaleString(),
      value: item.value,
      timestamp: item.time,
    }));
  };

  const filteredData = getFilteredData();

  // Calculate some statistics
  const oldestValue =
    filteredData.length > 0 ? filteredData[0].value : currentBalance;
  const change = currentBalance - oldestValue;
  const percentChange = oldestValue !== 0 ? (change / oldestValue) * 100 : 0;

  return (
    <div className="mt-8 px-4">
      <div className="h-48 mb-4">
        {filteredData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                strokeWidth={2}
                dot={false}
              />
              <XAxis dataKey="timestamp" hide domain={["dataMin", "dataMax"]} />
              <YAxis
                hide
                domain={[
                  (dataMin: number) => Math.max(0, dataMin * 0.95), // 5% below min, but not below 0
                  (dataMax: number) => dataMax * 1.05, // 5% above max
                ]}
              />
              <Tooltip
                formatter={(value: number) => [
                  `${value.toFixed(8)} BNB`,
                  "Balance",
                ]}
                labelFormatter={(label) =>
                  new Date(Number(label)).toLocaleString()
                }
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  borderColor: "#333",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            {isLoading
              ? "Loading balance data..."
              : isConnected
              ? "Collecting balance data..."
              : "Connect wallet to view balance history"}
          </div>
        )}
      </div>

      {filteredData.length > 0 && (
        <div className="text-center mb-4">
          <span
            className={`text-sm ${
              change >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(8)} BNB (
            {percentChange.toFixed(2)}%)
          </span>
        </div>
      )}

      <TimeFilter active={activePeriod} onClick={setActivePeriod} />
    </div>
  );
}
