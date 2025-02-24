"use client";
import { useState, useEffect } from "react";
import { Wallet } from "lucide-react";
import { useWalletStore } from "@/stores/useWalletStore";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>;
    };
  }
}

export function ConnectWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
  const { setAddress, isConnected } = useWalletStore();

  const checkIfWalletIsConnected = async (): Promise<void> => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        setError("Please install Rabby Wallet");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        setAddress(accounts[0]);
      }
    } catch (error) {
      console.error(error);
      setError("Error checking wallet connection");
    }
  };

  const connectWallet = async (): Promise<void> => {
    try {
      setIsConnecting(true);
      setError("");
      const { ethereum } = window;

      if (!ethereum) {
        setError("Please install Rabby Wallet");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setAddress(accounts[0]);
    } catch (error) {
      console.error(error);
      setError("Error connecting wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="px-4 mb-6">
      <button
        onClick={connectWallet}
        disabled={isConnecting || isConnected}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Wallet className="w-5 h-5" />
        {isConnecting
          ? "Connecting..."
          : isConnected
          ? "Connected"
          : "Connect Wallet"}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
