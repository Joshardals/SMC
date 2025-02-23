"use client";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

const TimeFilter = ({
  active,
  onClick,
}: {
  active: string;
  onClick: (period: string) => void;
}) => {
  const periods = ["1D", "1W", "1M", "1Y", "ALL"];
  return (
    <div className="flex justify-center gap-4 mt-4">
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onClick(period)}
          className={`px-3 py-1 rounded-lg text-sm ${
            active === period
              ? "bg-gray-700 text-white"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          {period}
        </button>
      ))}
    </div>
  );
};

export function ChartSection() {
  const [activePeriod, setActivePeriod] = useState("ALL");

  // Sample data - replace with your actual data
  const data = [
    { time: "2023-01", value: 2.5 },
    { time: "2023-02", value: 2.5 },
    { time: "2023-03", value: 2.5 },
    { time: "2023-04", value: 3.8 },
    { time: "2023-05", value: 5.2 },
    { time: "2023-06", value: 4.3 },
    { time: "2023-07", value: 4.8 },
    { time: "2023-08", value: 4.1 },
    { time: "2023-09", value: 5.62 },
  ];

  return (
    <div className="mt-8 px-4">
      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              strokeWidth={2}
              dot={false}
            />
            <XAxis dataKey="time" hide />
            <YAxis hide />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <TimeFilter active={activePeriod} onClick={setActivePeriod} />
    </div>
  );
}
