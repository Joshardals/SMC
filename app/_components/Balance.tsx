import { RotateCw } from "lucide-react";

export function Balance({ amount }: { amount: string }) {
  return (
    <div className="flex justify-between items-center mb-6 px-4">
      <div>
        <h2 className="text-gray-400 text-sm mb-1">Total Balance</h2>
        <h1 className="text-2xl font-bold text-white">${amount}</h1>
      </div>
      <button
        title="refresh balance"
        className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors"
      >
        <RotateCw className="w-5 h-5 text-gray-400" />
      </button>
    </div>
  );
}
