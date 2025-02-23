"use client";
import React, { useState } from "react";
import { ChevronDown, ArrowLeft, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export function Withdraw() {
  const [receipientAddress, setRecipientAddress] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("all");
  const [showAddresses, setShowAddresses] = useState(false);
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
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
          <button
            title="settings"
            type="button"
            className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors"
          >
            <Settings className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="mb-4">
            <div className="text-gray-400 mb-2 text-sm">Network</div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={() => setShowAddresses(!showAddresses)}
              className="w-full bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-start">
                  <span className="text-white font-medium">
                    {selectedAddress === "all"
                      ? "All Contracts"
                      : "Selected Contract"}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {selectedAddress === "all"
                      ? `Total: ${totalBalance} ETH`
                      : selectedAddress}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </motion.button>
          </div>

          {showAddresses && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700/50 overflow-hidden"
            >
              <button
                onClick={() => {
                  setSelectedAddress("all");
                  setShowAddresses(false);
                }}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-800 transition-colors border-b border-gray-700/50"
              >
                <div className="flex flex-col items-start">
                  <span className="text-white font-medium">All Contracts</span>
                  <span className="text-gray-400 text-sm">
                    {`Total: ${totalBalance} ETH`}
                  </span>
                </div>
                {selectedAddress === "all" && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
              {contractAddresses.map((contract) => (
                <button
                  key={contract.address}
                  onClick={() => {
                    setSelectedAddress(contract.address);
                    setShowAddresses(false);
                  }}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-800 transition-colors border-b border-gray-700/50 last:border-none"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-white font-medium">
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
            </motion.div>
          )}

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
