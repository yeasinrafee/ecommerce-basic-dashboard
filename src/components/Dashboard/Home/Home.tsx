import React, { useState } from 'react';
import { DollarSign, ShoppingCart, Clock, CheckCircle2 } from 'lucide-react';
import CustomDatePicker from '../../FormFields/CustomDatePicker';
import CustomSelect from '../../FormFields/CustomSelect';
import AnalyticsCard from '../../Chart/AnalyticsCard';
import AreaChart from '../../Chart/AreaChart';
import DonutChart from '../../Chart/DonutChart';

import { useForm } from 'react-hook-form';

const Home = () => {
  const { control, watch } = useForm({
    defaultValues: {
      month: '',
      year: new Date().getFullYear().toString(),
    },
  });

  const selectedMonth = watch('month');
  const selectedYear = watch('year');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const months = [
    { label: 'January', value: '1' },
    { label: 'February', value: '2' },
    { label: 'March', value: '3' },
    { label: 'April', value: '4' },
    { label: 'May', value: '5' },
    { label: 'June', value: '6' },
    { label: 'July', value: '7' },
    { label: 'August', value: '8' },
    { label: 'September', value: '9' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => {
    const year = currentYear - 5 + i;
    return { label: year.toString(), value: year.toString() };
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
        <div className="flex flex-wrap items-end gap-3 font-medium">
          <div className="w-56"> 
             <CustomDatePicker
                label="Start Date"
                value={startDate ?? null}
                onChange={(date) => setStartDate(date ?? undefined)}
             />
          </div>
          <div className="w-56">
             <CustomDatePicker
                label="End Date"
                value={endDate ?? null}
                onChange={(date) => setEndDate(date ?? undefined)}
             />
          </div>
          <div className="w-40">
            <CustomSelect 
              name="month"
              control={control}
              label="Month" 
              options={months} 
              placeholder="Select Month"
            />
          </div>
          <div className="w-32">
            <CustomSelect 
              name="year"
              control={control}
              label="Year" 
              options={years} 
              placeholder="Select Year"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard 
          title="Total Revenue" 
          amount="125,430" 
          count={1450} 
          icon={DollarSign} 
          color="bg-blue-500" 
        />
        <AnalyticsCard 
          title="Pending Orders" 
          amount="12,200" 
          count={85} 
          icon={Clock} 
          color="bg-orange-500" 
        />
        <AnalyticsCard 
          title="Confirmed Orders" 
          amount="45,800" 
          count={320} 
          icon={ShoppingCart} 
          color="bg-purple-500" 
        />
        <AnalyticsCard 
          title="Delivered Orders" 
          amount="67,430" 
          count={1045} 
          icon={CheckCircle2} 
          color="bg-green-500" 
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 font-sans">Revenue Overview</h2>
          <div className="w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px]">
            <AreaChart />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 font-sans">Orders by Category</h2>
          <div className="w-full flex-grow min-h-[300px]">
            <DonutChart type="category" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 font-sans">Orders by Brand</h2>
          <div className="w-full flex-grow min-h-[300px]">
            <DonutChart type="brand" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

