import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Calendar, Users, Award, Eye } from 'lucide-react';

interface ClientMetricTabSelectorProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const ClientMetricTabSelector: React.FC<ClientMetricTabSelectorProps> = ({
  activeTab,
  onTabChange
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Analysis Views</h3>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>
      
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="monthonmonth" className="text-sm font-medium">
            <Calendar className="w-4 h-4 mr-2" />
            Month-on-Month
          </TabsTrigger>
          <TabsTrigger value="yearonyear" className="text-sm font-medium">
            <TrendingUp className="w-4 h-4 mr-2" />
            Year-on-Year
          </TabsTrigger>
          <TabsTrigger value="hostedclasses" className="text-sm font-medium">
            <BarChart3 className="w-4 h-4 mr-2" />
            Hosted Classes
          </TabsTrigger>
          <TabsTrigger value="memberships" className="text-sm font-medium">
            <Award className="w-4 h-4 mr-2" />
            Memberships
          </TabsTrigger>
          <TabsTrigger value="detailed" className="text-sm font-medium">
            <Eye className="w-4 h-4 mr-2" />
            Detailed View
          </TabsTrigger>
          <TabsTrigger value="overview" className="text-sm font-medium">
            <Users className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};