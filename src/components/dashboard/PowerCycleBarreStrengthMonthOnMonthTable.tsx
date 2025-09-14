import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OptimizedTable } from '@/components/ui/OptimizedTable';
import { ProcessedTrainerData } from './TrainerDataProcessor';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PowerCycleBarreStrengthMonthOnMonthTableProps {
  data: ProcessedTrainerData[];
  onRowClick: (rowData: any) => void;
}

interface MonthlyComparison {
  trainerName: string;
  location: string;
  months: { [key: string]: {
    sessions: number;
    revenue: number;
    customers: number;
    cycleRevenue: number;
    barreRevenue: number;
    strengthRevenue: number;
    cycleSessions: number;
    barreSessions: number;
    strengthSessions: number;
  }};
  totalSessions: number;
  totalRevenue: number;
  avgMonthlyRevenue: number;
  growth: number;
}

export const PowerCycleBarreStrengthMonthOnMonthTable: React.FC<PowerCycleBarreStrengthMonthOnMonthTableProps> = ({ 
  data, 
  onRowClick 
}) => {
  const [viewMode, setViewMode] = useState<'revenue' | 'sessions' | 'formats'>('revenue');

  // Process data to create month-on-month comparison
  const monthlyData = useMemo(() => {
    const trainerMap = new Map<string, MonthlyComparison>();
    
    data.forEach(trainer => {
      const key = `${trainer.trainerName}-${trainer.location}`;
      const month = trainer.monthYear || 'Unknown';
      
      if (!trainerMap.has(key)) {
        trainerMap.set(key, {
          trainerName: trainer.trainerName,
          location: trainer.location,
          months: {},
          totalSessions: 0,
          totalRevenue: 0,
          avgMonthlyRevenue: 0,
          growth: 0
        });
      }
      
      const trainerData = trainerMap.get(key)!;
      trainerData.months[month] = {
        sessions: trainer.totalSessions,
        revenue: trainer.totalPaid,
        customers: trainer.totalCustomers,
        cycleRevenue: trainer.cycleRevenue,
        barreRevenue: trainer.barreRevenue,
        strengthRevenue: trainer.strengthRevenue,
        cycleSessions: trainer.cycleSessions,
        barreSessions: trainer.barreSessions,
        strengthSessions: trainer.strengthSessions
      };
      
      trainerData.totalSessions += trainer.totalSessions;
      trainerData.totalRevenue += trainer.totalPaid;
    });
    
    // Calculate averages and growth
    trainerMap.forEach(trainer => {
      const months = Object.keys(trainer.months);
      trainer.avgMonthlyRevenue = months.length > 0 ? trainer.totalRevenue / months.length : 0;
      
      // Calculate growth between first and last month
      if (months.length > 1) {
        const sortedMonths = months.sort();
        const firstMonth = trainer.months[sortedMonths[0]];
        const lastMonth = trainer.months[sortedMonths[sortedMonths.length - 1]];
        
        if (firstMonth.revenue > 0) {
          trainer.growth = ((lastMonth.revenue - firstMonth.revenue) / firstMonth.revenue) * 100;
        }
      }
    });
    
    return Array.from(trainerMap.values())
      .filter(trainer => trainer.totalRevenue > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [data]);

  // Get all unique months sorted
  const allMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    monthlyData.forEach(trainer => {
      Object.keys(trainer.months).forEach(month => monthsSet.add(month));
    });
    
    return Array.from(monthsSet).sort((a, b) => {
      // Sort by year-month
      const [aMonth, aYear] = a.split('-');
      const [bMonth, bYear] = b.split('-');
      
      if (aYear !== bYear) {
        return parseInt(aYear) - parseInt(bYear);
      }
      
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
    });
  }, [monthlyData]);

  // Create columns dynamically based on available months
  const columns = useMemo(() => {
    const baseColumns = [
      {
        key: 'trainerName',
        header: 'Trainer',
        render: (value: string, row: MonthlyComparison) => (
          <div className="flex flex-col min-w-[150px]">
            <span className="font-semibold text-gray-900">{value}</span>
            <span className="text-xs text-gray-500">{row.location}</span>
          </div>
        ),
        className: 'min-w-[150px]'
      }
    ];

    const monthColumns = allMonths.map(month => ({
      key: month,
      header: month,
      render: (value: any, row: MonthlyComparison) => {
        const monthData = row.months[month];
        if (!monthData) return <span className="text-gray-400">-</span>;

        switch (viewMode) {
          case 'sessions':
            return (
              <div className="text-center min-w-[80px]">
                <div className="font-bold text-blue-600">{formatNumber(monthData.sessions)}</div>
                <div className="text-xs text-gray-500">{formatNumber(monthData.customers)} customers</div>
              </div>
            );
          case 'formats':
            return (
              <div className="text-center min-w-[120px]">
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <div className="text-blue-600">C: {formatNumber(monthData.cycleSessions)}</div>
                  <div className="text-pink-600">B: {formatNumber(monthData.barreSessions)}</div>
                  <div className="text-green-600">S: {formatNumber(monthData.strengthSessions)}</div>
                </div>
              </div>
            );
          default: // revenue
            return (
              <div className="text-center min-w-[100px]">
                <div className="font-bold text-green-600">{formatCurrency(monthData.revenue)}</div>
                <div className="text-xs text-gray-500">{formatNumber(monthData.sessions)} sessions</div>
              </div>
            );
        }
      },
      align: 'center' as const,
      className: 'min-w-[100px]'
    }));

    const summaryColumns = [
      {
        key: 'totalRevenue',
        header: 'Total',
        render: (value: number, row: MonthlyComparison) => (
          <div className="text-center min-w-[100px]">
            <div className="font-bold text-gray-900">{formatCurrency(value)}</div>
            <div className="text-xs text-gray-500">{formatNumber(row.totalSessions)} sessions</div>
          </div>
        ),
        align: 'center' as const,
        className: 'min-w-[100px]'
      },
      {
        key: 'avgMonthlyRevenue',
        header: 'Avg/Month',
        render: (value: number) => (
          <div className="text-center min-w-[100px]">
            <span className="font-bold text-purple-600">{formatCurrency(value)}</span>
          </div>
        ),
        align: 'center' as const,
        className: 'min-w-[100px]'
      },
      {
        key: 'growth',
        header: 'Growth',
        render: (value: number) => {
          const isPositive = value > 0;
          const isNegative = value < 0;
          
          return (
            <div className="text-center min-w-[80px]">
              <Badge className={cn(
                isPositive ? 'bg-green-100 text-green-800' :
                isNegative ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              )}>
                {isPositive && <TrendingUp className="w-3 h-3 mr-1" />}
                {isNegative && <TrendingDown className="w-3 h-3 mr-1" />}
                {formatPercentage(Math.abs(value))}
              </Badge>
            </div>
          );
        },
        align: 'center' as const,
        className: 'min-w-[80px]'
      }
    ];

    return [...baseColumns, ...monthColumns, ...summaryColumns];
  }, [allMonths, viewMode]);

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-blue-50/20 border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Month-on-Month Performance Comparison
            <Badge className="bg-white/20 text-white border-white/30 ml-2">
              {allMonths.length} Months
            </Badge>
          </CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('revenue')}
              className={cn(
                "px-3 py-1 rounded text-sm font-medium transition-colors",
                viewMode === 'revenue' 
                  ? "bg-white text-slate-700" 
                  : "text-white hover:bg-white/10"
              )}
            >
              Revenue
            </button>
            <button
              onClick={() => setViewMode('sessions')}
              className={cn(
                "px-3 py-1 rounded text-sm font-medium transition-colors",
                viewMode === 'sessions' 
                  ? "bg-white text-slate-700" 
                  : "text-white hover:bg-white/10"
              )}
            >
              Sessions
            </button>
            <button
              onClick={() => setViewMode('formats')}
              className={cn(
                "px-3 py-1 rounded text-sm font-medium transition-colors",
                viewMode === 'formats' 
                  ? "bg-white text-slate-700" 
                  : "text-white hover:bg-white/10"
              )}
            >
              Formats
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {viewMode === 'formats' && (
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span>C = PowerCycle</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-pink-600 rounded"></div>
                <span>B = Barre</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span>S = Strength Lab</span>
              </div>
            </div>
          )}
          
          <OptimizedTable
            data={monthlyData}
            columns={columns}
            onRowClick={onRowClick}
            stickyHeader={true}
            stickyFirstColumn={true}
            maxHeight="600px"
          />
        </div>
      </CardContent>
    </Card>
  );
};