"use client";
import React, { useState } from "react";
import {
  FileCode2,
  History,
  ChevronRight,
  ArrowLeft,
  ArrowUpDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export function Addresses() {
  const [selectedView, setSelectedView] = useState("basic");
  const [sortDesc, setSortDesc] = useState(true);
  const router = useRouter();

  const mockContracts = [
    { address: "0x1234...5678", timestamp: "2h ago", balance: "0.5" },
    { address: "0x8765...4321", timestamp: "1d ago", balance: "1.2" },
    { address: "0x9876...2468", timestamp: "3d ago", balance: "0.8" },
    { address: "0x5432...1357", timestamp: "4d ago", balance: "2.1" },
  ];

  const sortedContracts = [...mockContracts].sort((a, b) => {
    if (sortDesc) {
      return parseFloat(b.balance) - parseFloat(a.balance);
    }
    return parseFloat(a.balance) - parseFloat(b.balance);
  });

  const displayContracts =
    selectedView === "basic"
      ? sortedContracts.map((c) => ({ ...c, type: "Contract Created" }))
      : sortedContracts
          .filter((c) => parseFloat(c.balance) > 0)
          .map((c) => ({ ...c, type: "Contract with Balance" }));

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
            <div className="text-3xl font-bold text-white mb-2">
              {mockContracts.length}
            </div>
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

          {displayContracts.length > 0 ? (
            <div className="space-y-4">
              {displayContracts.map((item, index) => (
                <motion.div
                  key={item.address + index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700/50"
                >
                  <div className="flex flex-col">
                    <span className="text-white text-sm">{item.type}</span>
                    <span className="text-gray-400 text-xs">
                      {item.address}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-blue-400 text-sm">
                        {item.balance} ETH
                      </div>
                      <div className="text-gray-500 text-xs">
                        {item.timestamp}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                </motion.div>
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
