"use client";
import React, { useState } from "react";
import { ArrowLeft, UserPlus, UserMinus, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export function Admin() {
  const router = useRouter();
  const [newAdminAddress, setNewAdminAddress] = useState("");
  const [checkAddress, setCheckAddress] = useState("");
  const [removeAddress, setRemoveAddress] = useState("");

  // Example list of current admins
  const [currentAdmins] = useState(["0x1234...5678", "0x8765...4321"]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      <motion.div
        className="max-w-md mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
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
            />
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Add
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
            />
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
            >
              Remove
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
            />
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors"
            >
              Check
            </motion.button>
          </div>
        </motion.div>

        {/* Current Admins List */}
        <motion.div className="bg-gray-800/30 backdrop-blur-lg rounded-3xl p-6">
          <h2 className="text-white font-medium mb-4">Current Admins</h2>
          <div className="space-y-2">
            {currentAdmins.map((admin, index) => (
              <div
                key={index}
                className="bg-gray-800/50 rounded-xl p-3 text-gray-300 text-sm"
              >
                {admin}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
