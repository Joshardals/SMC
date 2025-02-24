"use client";
import React, { useState } from "react";
import { ArrowLeft, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export function Withdraw() {
  const [receipientAddress, setRecipientAddress] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("all");
  const router = useRouter();

  // Example contract addresses
  const contractAddresses = [
    { address: "0x1234...5678", balance: "0.5 ETH", network: "Ethereum" },
    { address: "0x8765...4321", balance: "1.2 ETH", network: "Ethereum" },
    { address: "0x9876...2468", balance: "0.8 ETH", network: "Ethereum" },
  ];

  const totalBalance = contractAddresses
    .reduce((sum, contract) => sum + parseFloat(contract.balance), 0)
    .toFixed(1);

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
          <button
            title="settings"
            type="button"
            className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors invisible"
          >
            <Settings className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="mb-4">
            <div className="text-gray-400 mb-2 text-sm">Network</div>
            <select
              title="address"
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              className="w-full bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all" className="bg-gray-800">
                All Contracts ({totalBalance} ETH)
              </option>
              {contractAddresses.map((contract) => (
                <option
                  key={contract.address}
                  value={contract.address}
                  className="bg-gray-800"
                >
                  {contract.address} ({contract.balance})
                </option>
              ))}
            </select>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-4 border border-gray-700/50"
          >
            <div className="text-gray-400 text-sm mb-2">To</div>
            <input
              type="text"
              className="w-full bg-transparent text-white outline-none"
              placeholder="Enter recipient address"
              value={receipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
            />
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="button"
            className="w-full bg-blue-600 text-white rounded-xl py-4 mt-8 font-medium hover:bg-blue-700 transition-colors"
          >
            Withdraw
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
