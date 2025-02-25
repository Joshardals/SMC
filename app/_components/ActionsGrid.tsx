"use client";
import React from "react";
import { Users, FileCode2, Wallet, LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

const ActionButton = ({ icon: Icon, label, onClick }: ActionButtonProps) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:bg-gray-800 transition-all w-full"
  >
    <div className="bg-blue-600 p-2 rounded-lg mb-2">
      <Icon className="w-5 h-5 text-white" />
    </div>
    <span className="text-gray-300 text-sm">{label}</span>
  </button>
);

export function ActionsGrid() {
  const router = useRouter();

  const handleWithdraw = () => {
    router.push("/withdraw");
  };

  const handleAddress = () => {
    router.push("/address");
  };

  const handleAdmin = () => {
    router.push("/admin");
  };

  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      <ActionButton icon={Users} label="Admins" onClick={handleAdmin} />
      <ActionButton
        icon={FileCode2}
        label="Addresses"
        onClick={handleAddress}
      />
      <ActionButton icon={Wallet} label="Withdraw" onClick={handleWithdraw} />
    </div>
  );
}
