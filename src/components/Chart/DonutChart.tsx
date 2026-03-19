"use client";

import React from "react";
import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "../../components/ui/chart";

const categoryData = [
  { name: "Electronics", value: 400, fill: "#3b82f6" },
  { name: "Clothing", value: 300, fill: "#8b5cf6" },
  { name: "Home & Garden", value: 300, fill: "#ec4899" },
  { name: "Beauty", value: 200, fill: "#f43f5e" },
  { name: "Sports", value: 100, fill: "#f59e0b" },
];

const brandData = [
  { name: "Nike", value: 500, fill: "#10b981" },
  { name: "Adidas", value: 400, fill: "#0ea5e9" },
  { name: "Apple", value: 300, fill: "#6366f1" },
  { name: "Samsung", value: 200, fill: "#d946ef" },
  { name: "Sony", value: 150, fill: "#f97316" },
];

const chartConfig = {
  value: {
    label: "Orders",
  },
} satisfies ChartConfig;

interface DonutChartProps {
  type: "category" | "brand";
}

const DonutChart = ({ type }: DonutChartProps) => {
  const data = type === "category" ? categoryData : brandData;

  return (
    <ChartContainer config={chartConfig} className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<ChartTooltipContent />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Legend 
            verticalAlign="bottom" 
            height={36}
            content={({ payload }) => (
              <ul className="flex flex-wrap justify-center gap-4 text-sm mt-4">
                {payload?.map((entry: any, index: number) => (
                  <li key={`item-${index}`} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                    <span className="text-gray-600 font-medium">{entry.value}</span>
                  </li>
                ))}
              </ul>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default DonutChart;

