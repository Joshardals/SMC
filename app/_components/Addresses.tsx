"use client";
import React, { useState } from "react";
import { FileCode2, History, ChevronRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export function Addresses() {
  const [selectedView, setSelectedView] = useState("basic");
  const router = useRouter();

  const contractHistory = [
    {
      id: 1,
      type: "Contract Created",
      address: "0x1234...5678",
      timestamp: "2h ago",
      value: "0.5 ETH",
    },
    {
      id: 2,
      type: "Balance Added",
      address: "0x8765...4321",
      timestamp: "1d ago",
      value: "1.2 ETH",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        {/* Header */}
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
          <div className="w-10" /> {/* Spacer for balanced layout */}
        </div>

        {/* Rest of the component remains the same */}
        <motion.div
          className="bg-gray-800/30 backdrop-blur-lg rounded-3xl p-6 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-500/20 p-4 rounded-full mb-4">
              <FileCode2 className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">12</div>
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
              <span className="text-gray-400">Recent Activity</span>
            </div>
          </div>

          {contractHistory.length > 0 ? (
            <div className="space-y-4">
              {contractHistory.map((item) => (
                <motion.div
                  key={item.id}
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
                      <div className="text-blue-400 text-sm">{item.value}</div>
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
              <div className="text-gray-500 text-sm">
                No history in the past 30 days
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
