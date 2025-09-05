import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PowerCycleBarreStrengthMetricCards } from './PowerCycleBarreStrengthMetricCards';
import { PowerCycleBarreStrengthComparison } from './PowerCycleBarreStrengthComparison';
import { PowerCycleBarreStrengthAdvancedCharts } from './PowerCycleBarreStrengthAdvancedCharts';
import { PowerCycleBarreStrengthRankings } from './PowerCycleBarreStrengthRankings';
import { PowerCycleBarreStrengthEnhancedDataTables } from './PowerCycleBarreStrengthEnhancedDataTables';
import { PowerCycleBarreStrengthEnhancedFilterSection } from './PowerCycleBarreStrengthEnhancedFilterSection';
import { PowerCycleBarreStrengthLocationSelector } from './PowerCycleBarreStrengthLocationSelector';
import { DrillDownModal } from './DrillDownModal';
import { SourceDataModal } from '@/components/ui/SourceDataModal';
import { usePayrollData } from '@/hooks/usePayrollData';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { TrendingUp, BarChart3, Activity, Users, Eye, Zap } from 'lucide-react';

interface PowerCycleVsBarreSectionProps {
  data: any[];
}

export const PowerCycleVsBarreSection: React.FC<PowerCycleVsBarreSectionProps> = ({ data: payrollData }) => {
  const { setLoading } = useGlobalLoading();
  
  console.log('PowerCycleVsBarreSection - payrollData:', payrollData?.length, 'items');
  
  const [activeTab, setActiveTab] = useState('overview');
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [showSourceData, setShowSourceData] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [selectedTrainer, setSelectedTrainer] = useState('all');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });

  React.useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  // Filter data based on selected filters
  const filteredData = React.useMemo(() => {
    console.log('Filtering payrollData:', payrollData?.length, 'items');
    if (!payrollData) return [];
    
    let filtered = payrollData;
    console.log('Before filtering:', filtered.length, 'items');
    
    // Apply location filter
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(item => item.location === selectedLocation);
      console.log('After location filter:', filtered.length, 'items');
    }
    
    // Apply trainer filter
    if (selectedTrainer !== 'all') {
      filtered = filtered.filter(item => item.teacherName === selectedTrainer);
      console.log('After trainer filter:', filtered.length, 'items');
    }
    
    // Apply timeframe filter - Enhanced with custom date range support
    if (selectedTimeframe !== 'all') {
      if (selectedTimeframe === 'custom' && (dateRange.start || dateRange.end)) {
        // Handle custom date range
        filtered = filtered.filter(item => {
          if (!item.monthYear) return false;
          
          const [monthName, year] = item.monthYear.split(' ');
          const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'].indexOf(monthName);
          const itemDate = new Date(parseInt(year), monthIndex, 1);
          
          let isInRange = true;
          
          if (dateRange.start) {
            const startDate = new Date(dateRange.start);
            startDate.setDate(1); // Set to first day of month for comparison
            isInRange = isInRange && itemDate >= startDate;
          }
          
          if (dateRange.end) {
            const endDate = new Date(dateRange.end);
            endDate.setMonth(endDate.getMonth() + 1, 0); // Set to last day of month
            isInRange = isInRange && itemDate <= endDate;
          }
          
          return isInRange;
        });
        console.log('After custom date range filter:', filtered.length, 'items');
      } else if (selectedTimeframe !== 'custom') {
        // Handle preset timeframes
        const now = new Date();
        let startDate = new Date();
        
        switch (selectedTimeframe) {
          case '3m':
            startDate.setMonth(now.getMonth() - 3);
            break;
          case '6m':
            startDate.setMonth(now.getMonth() - 6);
            break;
          case '1y':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          default:
            console.log('No timeframe filter applied');
            return filtered;
        }
        
        filtered = filtered.filter(item => {
          if (!item.monthYear) return false;
          const [monthName, year] = item.monthYear.split(' ');
          const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'].indexOf(monthName);
          const itemDate = new Date(parseInt(year), monthIndex, 1);
          return itemDate >= startDate && itemDate <= now;
        });
        console.log('After preset timeframe filter:', filtered.length, 'items');
      }
    }
    
    console.log('Final filtered data:', filtered.length, 'items');
    return filtered;
  }, [payrollData, selectedLocation, selectedTimeframe, selectedTrainer, dateRange]);

  const handleItemClick = (item: any) => {
    setDrillDownData(item);
  };

  if (!payrollData || payrollData.length === 0) {
    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-6">
          <p className="text-yellow-600">No PowerCycle vs Barre data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Location Selector Tabs */}
      <PowerCycleBarreStrengthLocationSelector
        data={payrollData || []}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
      />

      {/* Enhanced Filter Section */}
      <PowerCycleBarreStrengthEnhancedFilterSection 
        data={payrollData || []}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
        selectedTrainer={selectedTrainer}
        onTrainerChange={setSelectedTrainer}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {/* Metric Cards */}
      <PowerCycleBarreStrengthMetricCards data={filteredData} />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-4">
              <TabsList className="grid w-full grid-cols-5 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger value="overview" className="text-sm font-medium">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="charts" className="text-sm font-medium">
                  <Activity className="w-4 h-4 mr-2" />
                  Advanced Charts
                </TabsTrigger>
                <TabsTrigger value="rankings" className="text-sm font-medium">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Rankings
                </TabsTrigger>
                <TabsTrigger value="tables" className="text-sm font-medium">
                  <Users className="w-4 h-4 mr-2" />
                  Data Analytics
                </TabsTrigger>
                <TabsTrigger value="insights" className="text-sm font-medium">
                  <Eye className="w-4 h-4 mr-2" />
                  Deep Insights
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          <TabsContent value="overview" className="space-y-8">
            <PowerCycleBarreStrengthComparison data={filteredData} onItemClick={handleItemClick} />
          </TabsContent>

          <TabsContent value="charts" className="space-y-8">
            <PowerCycleBarreStrengthAdvancedCharts data={filteredData} onDataPointClick={handleItemClick} />
          </TabsContent>

          <TabsContent value="rankings" className="space-y-8">
            <PowerCycleBarreStrengthRankings data={filteredData} onItemClick={handleItemClick} />
          </TabsContent>

          <TabsContent value="tables" className="space-y-8">
            <PowerCycleBarreStrengthEnhancedDataTables data={filteredData} onItemClick={handleItemClick} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PowerCycleBarreStrengthRankings data={filteredData} onItemClick={handleItemClick} />
              <PowerCycleBarreStrengthEnhancedDataTables data={filteredData} onItemClick={handleItemClick} />
            </div>
          </TabsContent>
        </Tabs>

      {/* Modals */}
      {drillDownData && (
        <DrillDownModal
          isOpen={!!drillDownData}
          onClose={() => setDrillDownData(null)}
          data={drillDownData}
          type="trainer"
        />
      )}

      {showSourceData && (
        <SourceDataModal
          open={showSourceData}
          onOpenChange={setShowSourceData}
          sources={[
            {
              name: "PowerCycle vs Barre vs Strength Analytics Data",
              data: payrollData || []
            }
          ]}
        />
      )}
    </div>
  );
};