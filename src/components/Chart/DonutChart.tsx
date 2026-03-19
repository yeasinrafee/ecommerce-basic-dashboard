"use client";

import React from "react";
import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "../../components/ui/chart";

const chartConfig = {
  value: {
    label: "Orders",
  },
} satisfies ChartConfig;

interface DonutChartProps {
  type: "category" | "brand";
  data: { name: string; value: number; fill: string }[];
}

const DonutChart = ({ type, data }: DonutChartProps) => {
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

