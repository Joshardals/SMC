"use client";
import React, { useState, useMemo } from "react";
import { ChevronDown, ArrowLeft, Settings, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export function Withdraw() {
  const [receipientAddress, setRecipientAddress] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("all");
  const [showAddresses, setShowAddresses] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Example contract addresses - simulate thousands of addresses
  const contractAddresses = Array.from({ length: 1000 }, () => ({
    address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
    balance: (Math.random() * 5).toFixed(2) + " ETH",
    network: "Ethereum"
  }));

  const totalBalance = contractAddresses
    .reduce((sum, contract) => sum + parseFloat(contract.balance), 0)
    .toFixed(1);

  const filteredAddresses = useMemo(() => {
    return contractAddresses.filter(contract =>
      contract.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

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
                    <h2 className="text-lg font-medium text-white">Select Contract</h2>
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
                        <span className="text-white font-medium">All Contracts</span>
                        <span className="text-gray-400 text-sm">
                          {`Total: ${totalBalance} ETH`}
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