"use client";
import { ArrowLeft, Settings, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export function Interactions() {
  const router = useRouter();

  const interactions = [
    {
      id: 1,
      type: "withdrawal",
      title: "Withdrawal",
      subtitle: "To 0x73b7...8c7f",
      amount: "- 30.00 USDC",
      timestamp: "2h ago",
      icon: "💸",
      status: "pending",
    },
    {
      id: 2,
      type: "contract_added",
      title: "New Contract",
      subtitle: "3 contracts registered",
      timestamp: "5h ago",
      icon: "📑",
      status: "completed",
    },
    {
      id: 3,
      type: "balance_update",
      title: "Balance Updated",
      subtitle: "Contract 0x24bb...26e0",
      amount: "+ 0.0090 BNB",
      timestamp: "1d ago",
      icon: "💰",
      status: "completed",
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
            onClick={() => router.push("/")}
            className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-400" />
          </button>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl text-white font-medium">Interactions</h1>
            <button className="flex items-center space-x-1 bg-gray-800/50 rounded-xl px-3 py-1">
              <span className="text-blue-400 text-sm">6 addresses</span>
              <ChevronDown className="w-4 h-4 text-blue-400" />
            </button>
          </div>
          <button
            title="settings"
            className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors invisible"
          >
            <Settings className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Interactions List */}
        <div className="space-y-3">
          {interactions.map((interaction) => (
            <motion.div
              key={interaction.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 flex items-center justify-center bg-gray-700/50 rounded-full">
                  <span className="text-xl">{interaction.icon}</span>
                </div>
                <div>
                  <div className="text-white font-medium">
                    {interaction.title}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {interaction.subtitle}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {interaction.timestamp}
                  </div>
                </div>
              </div>
              {interaction.amount && (
                <div
                  className={`text-right ${
                    interaction.amount.includes("+")
                      ? "text-green-400"
                      : "text-gray-400"
                  }`}
                >
                  {interaction.amount}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
