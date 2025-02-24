"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft, UserPlus, UserMinus, Search, Wallet } from "lucide-react";
import { motion } from "framer-motion";
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

// Define the contract interface for TypeScript
interface ContractInterface {
  x8(address: string): Promise<ContractTransactionResponse>;
  x10(address: string): Promise<ContractTransactionResponse>;
  x6(address: string): Promise<boolean>;
  x14(): Promise<string[]>;
  x15(): Promise<string[]>;
}

export function Admin(): React.ReactElement {
  const router = useRouter();
  const [newAdminAddress, setNewAdminAddress] = useState<string>("");
  const [checkAddress, setCheckAddress] = useState<string>("");
  const [removeAddress, setRemoveAddress] = useState<string>("");
  const { address: connectedAddress, isConnected } = useWalletStore();
  const [adminStatus, setAdminStatus] = useState<boolean | null>(null);
  const [isAddingAdmin, setIsAddingAdmin] = useState<boolean>(false);
  const [isRemovingAdmin, setIsRemovingAdmin] = useState<boolean>(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState<boolean>(false);
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

  // Function to add a new admin
  const addAdmin = async (): Promise<void> => {
    if (!newAdminAddress) {
      setStatusMessage("Please enter a valid wallet address");
      return;
    }

    if (!contract) {
      setStatusMessage(
        "Contract not initialized. Please wait or reconnect your wallet."
      );
      return;
    }

    setIsAddingAdmin(true);
    setStatusMessage("Adding new admin...");

    try {
      // Call the addAuthorizedUser function (x8)
      const tx = await contract.x8(newAdminAddress);
      await tx.wait();
      setStatusMessage(`Successfully added ${newAdminAddress} as admin!`);
      setNewAdminAddress("");
    } catch (error) {
      console.error("Error adding admin:", error);
      setStatusMessage(
        "Failed to add admin. Check your permissions and try again."
      );
    } finally {
      setIsAddingAdmin(false);
    }
  };

  // Function to remove an admin
  const removeAdmin = async (): Promise<void> => {
    if (!removeAddress) {
      setStatusMessage("Please enter a valid wallet address");
      return;
    }

    if (!contract) {
      setStatusMessage(
        "Contract not initialized. Please wait or reconnect your wallet."
      );
      return;
    }

    setIsRemovingAdmin(true);
    setStatusMessage("Removing admin...");

    try {
      // Call the removeAuthorizedUser function (x10)
      const tx = await contract.x10(removeAddress);
      await tx.wait();
      setStatusMessage(`Successfully removed ${removeAddress} from admins!`);
      setRemoveAddress("");
    } catch (error) {
      console.error("Error removing admin:", error);
      setStatusMessage(
        "Failed to remove admin. You cannot remove yourself, or you might not have permission."
      );
    } finally {
      setIsRemovingAdmin(false);
    }
  };

  // Function to check if an address is an admin
  const checkAdminStatus = async (): Promise<void> => {
    if (!checkAddress) {
      setStatusMessage("Please enter a valid wallet address");
      return;
    }

    if (!contract) {
      setStatusMessage(
        "Contract not initialized. Please wait or reconnect your wallet."
      );
      return;
    }

    setIsCheckingAdmin(true);
    setStatusMessage("Checking admin status...");

    try {
      // Call the authorizedUsers function (x6)
      const isAdmin = await contract.x6(checkAddress);
      setAdminStatus(isAdmin);
      setStatusMessage(
        `Address ${checkAddress} is ${isAdmin ? "an admin" : "not an admin"}`
      );
    } catch (error) {
      console.error("Error checking admin status:", error);
      setStatusMessage("Failed to check admin status. Please try again.");
      setAdminStatus(null);
    } finally {
      setIsCheckingAdmin(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4 flex items-center justify-center">
        <div className="text-white text-center">
          <p>Please connect your wallet to access admin features</p>
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
        {/* Header with Connected Wallet */}
        <div className="flex items-center justify-between mb-6">
          <button
            title="go back"
            type="button"
            className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-6 h-6 text-gray-400" />
          </button>
          <h1 className="text-xl text-white font-medium">Admin Management</h1>
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

        {/* Add New Admin */}
        <motion.div className="bg-gray-800/30 backdrop-blur-lg rounded-3xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <UserPlus className="w-5 h-5 text-blue-500" />
            <h2 className="text-white font-medium">Add New Admin</h2>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newAdminAddress}
              onChange={(e) => setNewAdminAddress(e.target.value)}
              placeholder="Enter wallet address"
              className="flex-1 bg-gray-800/50 text-white rounded-xl px-4 py-2 outline-none border border-gray-700/50"
              disabled={isAddingAdmin}
            />
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              onClick={addAdmin}
              disabled={isAddingAdmin || !newAdminAddress}
            >
              {isAddingAdmin ? "Adding..." : "Add"}
            </motion.button>
          </div>
        </motion.div>

        {/* Remove Admin */}
        <motion.div className="bg-gray-800/30 backdrop-blur-lg rounded-3xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <UserMinus className="w-5 h-5 text-red-500" />
            <h2 className="text-white font-medium">Remove Admin</h2>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={removeAddress}
              onChange={(e) => setRemoveAddress(e.target.value)}
              placeholder="Enter wallet address"
              className="flex-1 bg-gray-800/50 text-white rounded-xl px-4 py-2 outline-none border border-gray-700/50"
              disabled={isRemovingAdmin}
            />
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              onClick={removeAdmin}
              disabled={isRemovingAdmin || !removeAddress}
            >
              {isRemovingAdmin ? "Removing..." : "Remove"}
            </motion.button>
          </div>
        </motion.div>

        {/* Check Admin Status */}
        <motion.div className="bg-gray-800/30 backdrop-blur-lg rounded-3xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Search className="w-5 h-5 text-gray-400" />
            <h2 className="text-white font-medium">Check Admin Status</h2>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={checkAddress}
              onChange={(e) => setCheckAddress(e.target.value)}
              placeholder="Enter wallet address"
              className="flex-1 bg-gray-800/50 text-white rounded-xl px-4 py-2 outline-none border border-gray-700/50"
              disabled={isCheckingAdmin}
            />
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
              onClick={checkAdminStatus}
              disabled={isCheckingAdmin || !checkAddress}
            >
              {isCheckingAdmin ? "Checking..." : "Check"}
            </motion.button>
          </div>
          {adminStatus !== null && (
            <div
              className={`mt-3 text-sm p-2 rounded-lg ${
                adminStatus
                  ? "bg-green-900/30 text-green-400"
                  : "bg-red-900/30 text-red-400"
              }`}
            >
              This address is {adminStatus ? "an admin" : "not an admin"}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
