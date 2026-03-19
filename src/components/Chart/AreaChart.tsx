"use client";

import React from "react";
import { Area, AreaChart as RechartsAreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "../../components/ui/chart";

const chartData = [
  { month: "January", revenue: 186, orders: 80 },
  { month: "February", revenue: 305, orders: 200 },
  { month: "March", revenue: 237, orders: 120 },
  { month: "April", revenue: 73, orders: 190 },
  { month: "May", revenue: 209, orders: 130 },
  { month: "June", revenue: 214, orders: 140 },
  { month: "July", revenue: 350, orders: 250 },
  { month: "August", revenue: 280, orders: 210 },
  { month: "September", revenue: 310, orders: 180 },
  { month: "October", revenue: 400, orders: 300 },
  { month: "November", revenue: 380, orders: 280 },
  { month: "December", revenue: 450, orders: 350 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#3b82f6",
  },
  orders: {
    label: "Orders",
    color: "#10b981",
  },
} satisfies ChartConfig;

const AreaChart = () => {
  return (
    <ChartContainer config={chartConfig} className="w-full h-full text-sans min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={chartData}
          margin={{
            left: 12,
            right: 12,
            top: 12,
            bottom: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <defs>
            <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Area
            dataKey="orders"
            type="natural"
            fill="url(#fillOrders)"
            fillOpacity={0.4}
            stroke="#10b981"
            stackId="a"
          />
          <Area
            dataKey="revenue"
            type="natural"
            fill="url(#fillRevenue)"
            fillOpacity={0.4}
            stroke="#3b82f6"
            stackId="a"
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default AreaChart;

