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

// Contract details (same as Balance component)
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

interface BalanceDataPoint {
  time: string;
  value: number;
  timestamp: number;
}

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
              ? "bg-blue-600 text-white"
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
  const [balanceHistory, setBalanceHistory] = useState<BalanceDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected } = useWalletStore();

  // Function to fetch current balance
  const fetchCurrentBalance = async (): Promise<number> => {
    if (!window.ethereum || !isConnected) {
      return 0;
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

      if (!allContractsResult || allContractsResult.length === 0) {
        return 0;
      }

      // Calculate total balance
      let total = 0;
      for (const address of allContractsResult) {
        try {
          const balanceWei = await provider.getBalance(address);
          const balanceInBNB = parseFloat(ethers.formatEther(balanceWei));
          total += balanceInBNB;
        } catch (e) {
          console.error(`Error getting balance for ${address}:`, e);
        }
      }

      return total;
    } catch (err) {
      console.error("Error fetching balance:", err);
      return 0;
    }
  };

  // Load balance history from localStorage
  useEffect(() => {
    const loadBalanceHistory = () => {
      try {
        const storedHistory = localStorage.getItem("bnbBalanceHistory");
        if (storedHistory) {
          const parsedHistory = JSON.parse(storedHistory) as BalanceDataPoint[];
          setBalanceHistory(parsedHistory);
        } else {
          // If no history exists, create a simulated starting history
          const simulatedHistory = generateSimulatedHistory();
          setBalanceHistory(simulatedHistory);
          localStorage.setItem(
            "bnbBalanceHistory",
            JSON.stringify(simulatedHistory)
          );
        }
      } catch (err) {
        console.error("Error loading balance history:", err);
        setError("Failed to load balance history");
      }
    };

    const updateCurrentBalance = async () => {
      setIsLoading(true);
      try {
        // Fetch current balance
        const currentBalance = await fetchCurrentBalance();

        // Format date for display
        const now = new Date();
        const formattedTime = `${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

        // Only add new data point if it's different from the last one or after a time threshold
        const newDataPoint: BalanceDataPoint = {
          time: formattedTime,
          value: currentBalance,
          timestamp: now.getTime(),
        };

        setBalanceHistory((prevHistory) => {
          // Only add if we have no history or the balance has changed or it's been over 1 hour
          const shouldAdd =
            prevHistory.length === 0 ||
            prevHistory[prevHistory.length - 1].value !== currentBalance ||
            now.getTime() - prevHistory[prevHistory.length - 1].timestamp >
              3600000;

          if (!shouldAdd) return prevHistory;

          const updatedHistory = [...prevHistory, newDataPoint];
          // Store back to localStorage
          localStorage.setItem(
            "bnbBalanceHistory",
            JSON.stringify(updatedHistory)
          );
          return updatedHistory;
        });
      } catch (err) {
        console.error("Error updating balance:", err);
        setError("Failed to update current balance");
      } finally {
        setIsLoading(false);
      }
    };

    loadBalanceHistory();
    if (isConnected) {
      updateCurrentBalance();
    }

    // Set up interval to update balance periodically (every 15 minutes)
    const intervalId = setInterval(() => {
      if (isConnected) {
        updateCurrentBalance();
      }
    }, 15 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isConnected]);

  // Generate simulated history for initial display
  const generateSimulatedHistory = (): BalanceDataPoint[] => {
    const history: BalanceDataPoint[] = [];
    const now = new Date();

    // Create data points for the past year with a generally increasing trend
    for (let i = 365; i >= 0; i -= 7) {
      // Weekly data points
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const formattedTime = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      // Start with a small value and gradually increase with some randomness
      const baseValue = 0.5 + (365 - i) * 0.01; // Base increasing trend
      const randomFactor = Math.random() * 0.2 - 0.1; // Random fluctuation
      const value = Math.max(0, baseValue + randomFactor);

      history.push({
        time: formattedTime,
        value: parseFloat(value.toFixed(4)),
        timestamp: date.getTime(),
      });
    }

    return history;
  };

  // Filter data based on active period
  const getFilteredData = () => {
    if (balanceHistory.length === 0) return [];

    const now = new Date().getTime();
    let filteredData = [...balanceHistory];

    switch (activePeriod) {
      case "1D":
        filteredData = balanceHistory.filter(
          (item) => now - item.timestamp <= 24 * 60 * 60 * 1000
        );
        break;
      case "1W":
        filteredData = balanceHistory.filter(
          (item) => now - item.timestamp <= 7 * 24 * 60 * 60 * 1000
        );
        break;
      case "1M":
        filteredData = balanceHistory.filter(
          (item) => now - item.timestamp <= 30 * 24 * 60 * 60 * 1000
        );
        break;
      case "1Y":
        filteredData = balanceHistory.filter(
          (item) => now - item.timestamp <= 365 * 24 * 60 * 60 * 1000
        );
        break;
      // ALL - no filtering needed
    }

    // Ensure we have at least 2 data points for a meaningful chart
    if (filteredData.length < 2) {
      // If not enough data in the period, generate some simulated data points
      const oldest = filteredData[0] || balanceHistory[0];
      const newest =
        filteredData[filteredData.length - 1] ||
        balanceHistory[balanceHistory.length - 1];

      // Create a simple linear progression between the oldest and newest points
      const result = interpolateDataPoints(oldest, newest, activePeriod);
      return result;
    }

    return filteredData;
  };

  // Helper to interpolate between two data points
  const interpolateDataPoints = (
    oldest: BalanceDataPoint,
    newest: BalanceDataPoint,
    period: string
  ): BalanceDataPoint[] => {
    const result = [oldest];

    let points = 5; // Default number of points to generate

    switch (period) {
      case "1D":
        points = 24;
        break; // Hourly
      case "1W":
        points = 7;
        break; // Daily
      case "1M":
        points = 30;
        break; // Daily
      case "1Y":
        points = 12;
        break; // Monthly
      case "ALL":
        points = 12;
        break; // Yearly or whatever makes sense
    }

    const timeDiff = newest.timestamp - oldest.timestamp;
    const valueDiff = newest.value - oldest.value;

    for (let i = 1; i < points - 1; i++) {
      const timeOffset = timeDiff * (i / (points - 1));
      const timestamp = oldest.timestamp + timeOffset;
      const date = new Date(timestamp);
      const formattedTime = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      // Add some randomness to the interpolation for a more natural look
      const randomFactor = Math.random() * 0.1 - 0.05; // ±5% random variation
      const interpolatedValue = oldest.value + valueDiff * (i / (points - 1));
      const value = Math.max(0, interpolatedValue * (1 + randomFactor));

      result.push({
        time: formattedTime,
        value: parseFloat(value.toFixed(4)),
        timestamp,
      });
    }

    result.push(newest);
    return result;
  };

  const filteredData = getFilteredData();

  return (
    <div className="mt-8 px-4">
      <h3 className="text-gray-400 text-sm mb-2 px-2">Balance History</h3>
      <div className="bg-gray-800/30 backdrop-blur-lg rounded-3xl p-4">
        {isLoading && filteredData.length === 0 ? (
          <div className="h-48 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="h-48 flex items-center justify-center text-red-400">
            {error}
          </div>
        ) : (
          <>
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6" // Blue color to match theme
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      if (activePeriod === "1D") {
                        return `${date.getHours()}:00`;
                      }
                      if (activePeriod === "1W") {
                        return value.split("-").slice(1).join("/");
                      }
                      return value.split("-").slice(1).join("/");
                    }}
                  />
                  <YAxis hide domain={["dataMin - 0.1", "dataMax + 0.1"]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "0.5rem",
                      color: "white",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                    itemStyle={{ color: "#3b82f6" }}
                    formatter={(value: number) => [
                      `${value.toFixed(4)} BNB`,
                      "Balance",
                    ]}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return `${date.toLocaleDateString()} ${
                        activePeriod === "1D" ? date.toLocaleTimeString() : ""
                      }`;
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <TimeFilter active={activePeriod} onClick={setActivePeriod} />
          </>
        )}
      </div>
    </div>
  );
}
