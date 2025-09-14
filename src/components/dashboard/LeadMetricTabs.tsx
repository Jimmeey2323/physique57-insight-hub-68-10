
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadsMetricType } from '@/types/leads';

interface LeadMetricTabsProps {
  value: LeadsMetricType;
  onValueChange: (value: LeadsMetricType) => void;
  className?: string;
}

export const LeadMetricTabs: React.FC<LeadMetricTabsProps> = ({
  value,
  onValueChange,
  className = ""
}) => {
  return (
    <Tabs value={value} onValueChange={onValueChange} className={className}>
      <TabsList className="grid w-full grid-cols-6 bg-white border border-gray-200 p-1 rounded-xl shadow-sm h-14">
        <TabsTrigger
          value="totalLeads"
          className="relative overflow-hidden rounded-lg px-3 py-2 font-semibold text-xs transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
        >
          Total Leads
        </TabsTrigger>
        <TabsTrigger
          value="leadToTrialConversion"
          className="relative overflow-hidden rounded-lg px-3 py-2 font-semibold text-xs transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
        >
          Lead to Trial %
        </TabsTrigger>
        <TabsTrigger
          value="trialToMembershipConversion"
          className="relative overflow-hidden rounded-lg px-3 py-2 font-semibold text-xs transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
        >
          Trial to Member %
        </TabsTrigger>
        <TabsTrigger
          value="ltv"
          className="relative overflow-hidden rounded-lg px-3 py-2 font-semibold text-xs transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
        >
          Average LTV
        </TabsTrigger>
        <TabsTrigger
          value="totalRevenue"
          className="relative overflow-hidden rounded-lg px-3 py-2 font-semibold text-xs transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
        >
          Total Revenue
        </TabsTrigger>
        <TabsTrigger
          value="visitFrequency"
          className="relative overflow-hidden rounded-lg px-3 py-2 font-semibold text-xs transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
        >
          Visit Frequency
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
