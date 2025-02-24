"use client";
import { useState, useEffect } from "react";
import { RotateCw } from "lucide-react";

export function Balance({ amount }: { amount: string }) {
  const [showUSD, setShowUSD] = useState(false);
  const [bnbPrice, setBnbPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBnbPrice = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd"
      );
      if (!response.ok) throw new Error("Failed to fetch BNB price");
      const data = await response.json();
      setBnbPrice(data.binancecoin.usd);
    } catch (err) {
      setError("Failed to load price");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBnbPrice();
  }, []);

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatBNB = (value: string) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(parseFloat(value));
  };

  const amountNumber = parseFloat(amount);
  const usdAmount = bnbPrice ? formatUSD(amountNumber * bnbPrice) : "$0.00";
  const formattedBNB = formatBNB(amount);

  return (
    <div className="flex justify-between items-center mb-6 px-4">
      <div>
        <h2 className="text-gray-400 text-sm mb-1">Total Balance</h2>
        <button
          onClick={() => setShowUSD(!showUSD)}
          className="flex items-center group hover:opacity-80 transition-opacity"
          disabled={isLoading || !!error}
        >
          <h1 className="text-2xl font-bold text-white">
            {showUSD ? usdAmount : formattedBNB}
          </h1>
          <span className="text-gray-400 text-lg ml-1">
            {showUSD ? "" : "BNB"}
          </span>
          {!isLoading && !error && (
            <span className="text-xs text-gray-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Click to toggle
            </span>
          )}
          {isLoading && (
            <span className="text-xs text-gray-500 ml-2">Loading price...</span>
          )}
          {error && <span className="text-xs text-red-500 ml-2">{error}</span>}
        </button>
        {!isLoading && !error && bnbPrice && (
          <p className="text-xs text-gray-500 mt-1">
            1 BNB = {formatUSD(bnbPrice)}
          </p>
        )}
      </div>
      <button
        title="refresh balance"
        className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors"
        onClick={fetchBnbPrice}
        disabled={isLoading}
      >
        <RotateCw
          className={`w-5 h-5 text-gray-400 ${isLoading ? "animate-spin" : ""}`}
        />
      </button>
    </div>
  );
}
