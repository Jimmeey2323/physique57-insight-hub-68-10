import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { ProcessedTrainerData } from './TrainerDataProcessor';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { Calendar, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PowerCycleBarreStrengthYearOnYearTableProps {
  data: ProcessedTrainerData[];
  onRowClick: (rowData: any) => void;
}

interface YearOnYearComparison {
  trainerName: string;
  location: string;
  currentYear: {
    revenue: number;
    sessions: number;
    customers: number;
    cycleRevenue: number;
    barreRevenue: number;
    strengthRevenue: number;
  };
  previousYear: {
    revenue: number;
    sessions: number;
    customers: number;
    cycleRevenue: number;
    barreRevenue: number;
    strengthRevenue: number;
  };
  revenueGrowth: number;
  sessionGrowth: number;
  customerGrowth: number;
  topFormat: string;
  formatGrowth: { [key: string]: number };
}

export const PowerCycleBarreStrengthYearOnYearTable: React.FC<PowerCycleBarreStrengthYearOnYearTableProps> = ({ 
  data, 
  onRowClick 
}) => {
  const [sortField, setSortField] = useState('revenueGrowth');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Process data to create year-on-year comparison
  const yearOnYearData = useMemo(() => {
    const trainerMap = new Map<string, { 
      trainerName: string; 
      location: string;
      years: { [year: string]: ProcessedTrainerData[] } 
    }>();
    
    // Group data by trainer and year
    data.forEach(trainer => {
      const key = `${trainer.trainerName}-${trainer.location}`;
      const year = trainer.monthYear?.split('-')[1] || '2024'; // Extract year from "Feb-2024"
      
      if (!trainerMap.has(key)) {
        trainerMap.set(key, {
          trainerName: trainer.trainerName,
          location: trainer.location,
          years: {}
        });
      }
      
      const trainerData = trainerMap.get(key)!;
      if (!trainerData.years[year]) {
        trainerData.years[year] = [];
      }
      trainerData.years[year].push(trainer);
    });
    
    const comparisons: YearOnYearComparison[] = [];
    
    // Calculate year-on-year comparisons
    trainerMap.forEach(trainer => {
      const years = Object.keys(trainer.years).sort();
      
      if (years.length >= 2) {
        const currentYear = years[years.length - 1];
        const previousYear = years[years.length - 2];
        
        const currentData = trainer.years[currentYear];
        const previousData = trainer.years[previousYear];
        
        // Aggregate data for each year
        const current = currentData.reduce((acc, t) => ({
          revenue: acc.revenue + t.totalPaid,
          sessions: acc.sessions + t.totalSessions,
          customers: acc.customers + t.totalCustomers,
          cycleRevenue: acc.cycleRevenue + t.cycleRevenue,
          barreRevenue: acc.barreRevenue + t.barreRevenue,
          strengthRevenue: acc.strengthRevenue + t.strengthRevenue
        }), { revenue: 0, sessions: 0, customers: 0, cycleRevenue: 0, barreRevenue: 0, strengthRevenue: 0 });
        
        const previous = previousData.reduce((acc, t) => ({
          revenue: acc.revenue + t.totalPaid,
          sessions: acc.sessions + t.totalSessions,
          customers: acc.customers + t.totalCustomers,
          cycleRevenue: acc.cycleRevenue + t.cycleRevenue,
          barreRevenue: acc.barreRevenue + t.barreRevenue,
          strengthRevenue: acc.strengthRevenue + t.strengthRevenue
        }), { revenue: 0, sessions: 0, customers: 0, cycleRevenue: 0, barreRevenue: 0, strengthRevenue: 0 });
        
        // Calculate growth rates
        const revenueGrowth = previous.revenue > 0 ? 
          ((current.revenue - previous.revenue) / previous.revenue) * 100 : 0;
        const sessionGrowth = previous.sessions > 0 ? 
          ((current.sessions - previous.sessions) / previous.sessions) * 100 : 0;
        const customerGrowth = previous.customers > 0 ? 
          ((current.customers - previous.customers) / previous.customers) * 100 : 0;
        
        // Determine top format
        const currentFormats = {
          'PowerCycle': current.cycleRevenue,
          'Barre': current.barreRevenue,
          'Strength Lab': current.strengthRevenue
        };
        const topFormat = Object.entries(currentFormats)
          .sort(([,a], [,b]) => b - a)[0][0];
        
        // Calculate format-specific growth
        const formatGrowth = {
          'PowerCycle': previous.cycleRevenue > 0 ? 
            ((current.cycleRevenue - previous.cycleRevenue) / previous.cycleRevenue) * 100 : 0,
          'Barre': previous.barreRevenue > 0 ? 
            ((current.barreRevenue - previous.barreRevenue) / previous.barreRevenue) * 100 : 0,
          'Strength Lab': previous.strengthRevenue > 0 ? 
            ((current.strengthRevenue - previous.strengthRevenue) / previous.strengthRevenue) * 100 : 0
        };
        
        comparisons.push({
          trainerName: trainer.trainerName,
          location: trainer.location,
          currentYear: current,
          previousYear: previous,
          revenueGrowth,
          sessionGrowth,
          customerGrowth,
          topFormat,
          formatGrowth
        });
      }
    });
    
    return comparisons;
  }, [data]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = useMemo(() => {
    return [...yearOnYearData].sort((a, b) => {
      const aValue = (a as any)[sortField] || 0;
      const bValue = (b as any)[sortField] || 0;
      
      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }, [yearOnYearData, sortField, sortDirection]);

  const columns = [
    {
      key: 'trainerName',
      header: 'Trainer',
      render: (value: string, row: YearOnYearComparison) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{value}</span>
          <span className="text-xs text-gray-500">{row.location}</span>
          <Badge className={cn(
            row.topFormat === 'PowerCycle' ? 'bg-blue-100 text-blue-800' :
            row.topFormat === 'Barre' ? 'bg-pink-100 text-pink-800' :
            'bg-green-100 text-green-800'
          )}>
            {row.topFormat}
          </Badge>
        </div>
      ),
      sortable: true
    },
    {
      key: 'currentYear',
      header: 'Current Year Revenue',
      render: (value: any) => (
        <div className="text-center">
          <div className="font-bold text-green-600">{formatCurrency(value.revenue)}</div>
          <div className="text-xs text-gray-500">{formatNumber(value.sessions)} sessions</div>
        </div>
      ),
      align: 'center' as const,
      sortable: false
    },
    {
      key: 'previousYear',
      header: 'Previous Year Revenue',
      render: (value: any) => (
        <div className="text-center">
          <div className="font-bold text-gray-600">{formatCurrency(value.revenue)}</div>
          <div className="text-xs text-gray-500">{formatNumber(value.sessions)} sessions</div>
        </div>
      ),
      align: 'center' as const,
      sortable: false
    },
    {
      key: 'revenueGrowth',
      header: 'Revenue Growth',
      render: (value: number) => {
        const isPositive = value > 0;
        const isNegative = value < 0;
        
        return (
          <div className="text-center">
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
      sortable: true
    },
    {
      key: 'sessionGrowth',
      header: 'Session Growth',
      render: (value: number) => {
        const isPositive = value > 0;
        const isNegative = value < 0;
        
        return (
          <div className="text-center">
            <Badge className={cn(
              isPositive ? 'bg-blue-100 text-blue-800' :
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
      sortable: true
    },
    {
      key: 'customerGrowth',
      header: 'Customer Growth',
      render: (value: number) => {
        const isPositive = value > 0;
        const isNegative = value < 0;
        
        return (
          <div className="text-center">
            <Badge className={cn(
              isPositive ? 'bg-purple-100 text-purple-800' :
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
      sortable: true
    },
    {
      key: 'formatGrowth',
      header: 'Format Growth',
      render: (value: { [key: string]: number }, row: YearOnYearComparison) => (
        <div className="space-y-1">
          <div className="text-xs">
            <span className="text-blue-600">PC: </span>
            <span className={cn(
              value['PowerCycle'] > 0 ? 'text-green-600' : 
              value['PowerCycle'] < 0 ? 'text-red-600' : 'text-gray-600'
            )}>
              {formatPercentage(Math.abs(value['PowerCycle']))}
              {value['PowerCycle'] > 0 ? '↑' : value['PowerCycle'] < 0 ? '↓' : ''}
            </span>
          </div>
          <div className="text-xs">
            <span className="text-pink-600">B: </span>
            <span className={cn(
              value['Barre'] > 0 ? 'text-green-600' : 
              value['Barre'] < 0 ? 'text-red-600' : 'text-gray-600'
            )}>
              {formatPercentage(Math.abs(value['Barre']))}
              {value['Barre'] > 0 ? '↑' : value['Barre'] < 0 ? '↓' : ''}
            </span>
          </div>
          <div className="text-xs">
            <span className="text-green-600">S: </span>
            <span className={cn(
              value['Strength Lab'] > 0 ? 'text-green-600' : 
              value['Strength Lab'] < 0 ? 'text-red-600' : 'text-gray-600'
            )}>
              {formatPercentage(Math.abs(value['Strength Lab']))}
              {value['Strength Lab'] > 0 ? '↑' : value['Strength Lab'] < 0 ? '↓' : ''}
            </span>
          </div>
        </div>
      ),
      align: 'center' as const,
      sortable: false
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-blue-50/20 border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white">
        <CardTitle className="flex items-center gap-2">
          <Target className="w-6 h-6" />
          Year-on-Year Performance Comparison
          <Badge className="bg-white/20 text-white border-white/30 ml-2">
            {yearOnYearData.length} Trainers with YoY Data
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-blue-600 font-medium">PC</span>
              <span>= PowerCycle</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-pink-600 font-medium">B</span>
              <span>= Barre</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-600 font-medium">S</span>
              <span>= Strength Lab</span>
            </div>
          </div>
          
          <ModernDataTable
            data={sortedData}
            columns={columns}
            onSort={handleSort}
            sortField={sortField}
            sortDirection={sortDirection}
            onRowClick={onRowClick}
            stickyHeader={true}
            maxHeight="600px"
            headerGradient="from-slate-600 to-slate-700"
          />
        </div>
      </CardContent>
    </Card>
  );
};