import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AutoCloseFilterSection } from './AutoCloseFilterSection';
import { PowerCycleBarreStrengthHeroSection } from './PowerCycleBarreStrengthHeroSection';
import { PowerCycleBarreStrengthAnimatedMetricCards } from './PowerCycleBarreStrengthAnimatedMetricCards';
import { PowerCycleBarreStrengthInteractiveCharts } from './PowerCycleBarreStrengthInteractiveCharts';
import { PowerCycleBarreStrengthDataTables } from './PowerCycleBarreStrengthDataTables';
import { PowerCycleBarreStrengthMonthOnMonthTable } from './PowerCycleBarreStrengthMonthOnMonthTable';
import { PowerCycleBarreStrengthYearOnYearTable } from './PowerCycleBarreStrengthYearOnYearTable';
import { PowerCycleBarreStrengthTopBottomLists } from './PowerCycleBarreStrengthTopBottomLists';
import { PowerCycleBarreStrengthDrillDownModal } from './PowerCycleBarreStrengthDrillDownModal';
import { NoteTaker } from '@/components/ui/NoteTaker';
import { PayrollData, FilterOptions } from '@/types/dashboard';
import { processTrainerData, ProcessedTrainerData } from './TrainerDataProcessor';
import { getPreviousMonthDateRange } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

interface PowerCycleBarreStrengthSectionProps {
  data: PayrollData[];
}

const locations = [{
  id: 'all',
  name: 'All Locations',
  fullName: 'All Locations'
}, {
  id: 'kwality',
  name: 'Kwality House, Kemps Corner',
  fullName: 'Kwality House, Kemps Corner'
}, {
  id: 'supreme',
  name: 'Supreme HQ, Bandra',
  fullName: 'Supreme HQ, Bandra'
}, {
  id: 'kenkere',
  name: 'Kenkere House',
  fullName: 'Kenkere House'
}];

export const PowerCycleBarreStrengthSection: React.FC<PowerCycleBarreStrengthSectionProps> = ({ data }) => {
  const [activeLocation, setActiveLocation] = useState('all');
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [drillDownType, setDrillDownType] = useState<'metric' | 'trainer' | 'format'>('metric');

  // Initialize filters with previous month as default
  const [filters, setFilters] = useState<FilterOptions>(() => {
    const previousMonth = getPreviousMonthDateRange();
    
    return {
      dateRange: previousMonth,
      location: [],
      category: [],
      product: [],
      soldBy: [],
      paymentMethod: []
    };
  });

  const applyFilters = (rawData: PayrollData[]) => {
    let filtered = [...rawData];

    // Apply location filter
    if (activeLocation !== 'all') {
      filtered = filtered.filter(item => {
        const locationMatch = activeLocation === 'kwality' 
          ? item.location === 'Kwality House, Kemps Corner' 
          : activeLocation === 'supreme' 
          ? item.location === 'Supreme HQ, Bandra' 
          : item.location?.includes('Kenkere') || item.location === 'Kenkere House';
        return locationMatch;
      });
    }

    // Apply date range filter for month/year
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(item => {
        if (!item.monthYear) return false;
        
        // Parse monthYear (e.g., "Feb-2024" or "February 2024")
        const [monthStr, yearStr] = item.monthYear.includes('-') 
          ? item.monthYear.split('-')
          : item.monthYear.split(' ');
        
        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        const fullMonthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        let monthIndex = monthNames.indexOf(monthStr);
        if (monthIndex === -1) {
          monthIndex = fullMonthNames.indexOf(monthStr);
        }
        
        if (monthIndex === -1) return false;
        
        const itemDate = new Date(parseInt(yearStr), monthIndex, 1);
        
        if (filters.dateRange.start && itemDate < new Date(filters.dateRange.start)) return false;
        if (filters.dateRange.end && itemDate > new Date(filters.dateRange.end)) return false;
        
        return true;
      });
    }

    return filtered;
  };

  const filteredData = useMemo(() => applyFilters(data), [data, filters, activeLocation]);
  const processedData = useMemo(() => processTrainerData(filteredData), [filteredData]);

  const handleRowClick = (rowData: any) => {
    setDrillDownData(rowData);
    setDrillDownType('trainer');
  };

  const handleMetricClick = (metricData: any) => {
    setDrillDownData(metricData);
    setDrillDownType('metric');
  };

  const resetFilters = () => {
    const previousMonth = getPreviousMonthDateRange();
    
    setFilters({
      dateRange: previousMonth,
      location: [],
      category: [],
      product: [],
      soldBy: [],
      paymentMethod: []
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero Section with Dynamic Metrics */}
      <PowerCycleBarreStrengthHeroSection data={processedData} />

      {/* Note Taker Component */}
      <div className="container mx-auto px-6">
        <NoteTaker />
      </div>

      {/* Filter and Location Tabs */}
      <div className="container mx-auto px-6 space-y-6">
        <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white/90 backdrop-blur-sm p-2 rounded-2xl shadow-xl border-0 grid grid-cols-4 w-full max-w-7xl min-h-24 overflow-hidden">
              {locations.map(location => (
                <TabsTrigger 
                  key={location.id} 
                  value={location.id} 
                  className="relative px-6 py-4 font-semibold text-gray-800 transition-all duration-300 ease-out hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-50 text-2xl rounded-2xl"
                >
                  <div className="relative z-10 text-center">
                    <div className="font-bold">{location.name.split(',')[0]}</div>
                    <div className="text-xs opacity-80">{location.name.split(',')[1]?.trim()}</div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {locations.map(location => (
            <TabsContent key={location.id} value={location.id} className="space-y-8">
              <div className="w-full">
                <AutoCloseFilterSection
                  filters={filters} 
                  onFiltersChange={setFilters} 
                  onReset={resetFilters} 
                />
              </div>

              <PowerCycleBarreStrengthAnimatedMetricCards 
                data={processedData} 
                onMetricClick={handleMetricClick}
              />

              <PowerCycleBarreStrengthInteractiveCharts 
                data={processedData}
                onChartClick={handleMetricClick}
              />

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-6 bg-gradient-to-r from-blue-100 to-purple-100 p-1 rounded-2xl shadow-lg">
                  <TabsTrigger value="overview" className="rounded-xl font-medium">Overview</TabsTrigger>
                  <TabsTrigger value="monthly" className="rounded-xl font-medium">Month-on-Month</TabsTrigger>
                  <TabsTrigger value="yearly" className="rounded-xl font-medium">Year-on-Year</TabsTrigger>
                  <TabsTrigger value="performance" className="rounded-xl font-medium">Performance</TabsTrigger>
                  <TabsTrigger value="format" className="rounded-xl font-medium">Format Analysis</TabsTrigger>
                  <TabsTrigger value="rankings" className="rounded-xl font-medium">Rankings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
              <PowerCycleBarreStrengthDataTables 
                data={processedData}
                onRowClick={handleRowClick}
              />
                </TabsContent>

                <TabsContent value="monthly" className="space-y-6">
                  <PowerCycleBarreStrengthMonthOnMonthTable 
                    data={processedData}
                    onRowClick={handleRowClick}
                  />
                </TabsContent>

                <TabsContent value="yearly" className="space-y-6">
                  <PowerCycleBarreStrengthYearOnYearTable 
                    data={processedData}
                    onRowClick={handleRowClick}
                  />
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                  <PowerCycleBarreStrengthDataTables 
                    data={processedData}
                    onRowClick={handleRowClick}
                    viewType="performance"
                  />
                </TabsContent>

                <TabsContent value="format" className="space-y-6">
                  <PowerCycleBarreStrengthDataTables 
                    data={processedData}
                    onRowClick={handleRowClick}
                    viewType="format"
                  />
                </TabsContent>

                <TabsContent value="rankings" className="space-y-6">
                  <PowerCycleBarreStrengthTopBottomLists 
                    data={processedData}
                    onItemClick={handleRowClick}
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Drill Down Modal */}
      {drillDownData && (
        <PowerCycleBarreStrengthDrillDownModal
          isOpen={!!drillDownData}
          onClose={() => setDrillDownData(null)}
          data={drillDownData}
          allData={processedData}
          type={drillDownType}
        />
      )}
    </div>
  );
};