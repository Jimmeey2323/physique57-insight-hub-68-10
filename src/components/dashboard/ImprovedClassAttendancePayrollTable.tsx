import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AdvancedExportButton } from '@/components/ui/AdvancedExportButton';
import { TrendingUp, TrendingDown, ArrowUpDown, Users, Calendar, DollarSign, BarChart3, Target, Activity } from 'lucide-react';
import { PayrollData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';

interface ImprovedClassAttendancePayrollTableProps {
  data: PayrollData[];
  location?: string;
}

interface ProcessedPayrollData {
  location: string;
  teacherName: string;
  monthYear: string;
  totalSessions: number;
  totalCustomers: number;
  totalPaid: number;
  emptySession: number;
  nonEmptySession: number;
  classAvgWithEmpty: number;
  classAvgWithoutEmpty: number;
  fillRate: number;
  cancelRate: number;
  revenuePerSession: number;
  utilizationRate: number;
  trends: {
    sessionsChange?: number;
    customersChange?: number;
    revenueChange?: number;
    fillRateChange?: number;
  };
}

export const ImprovedClassAttendancePayrollTable: React.FC<ImprovedClassAttendancePayrollTableProps> = ({
  data,
  location
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('classAvgWithoutEmpty');
  const [sortBy, setSortBy] = useState<string>('monthYear');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<string>('monthly');

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Filter by location if specified
    let filteredData = data;
    if (location && location !== 'all') {
      const locationMap = {
        'Kwality House, Kemps Corner': 'Kwality House, Kemps Corner',
        'Supreme HQ, Bandra': 'Supreme HQ, Bandra',
        'Kenkere House': 'Kenkere House'
      };
      const targetLocation = locationMap[location as keyof typeof locationMap];
      if (targetLocation) {
        filteredData = data.filter(item => 
          item.location === targetLocation || 
          (location === 'Kenkere House' && item.location?.includes('Kenkere'))
        );
      }
    }

    // Process and group data
    const grouped = filteredData.reduce((acc, item) => {
      const key = `${item.location}-${item.teacherName}-${item.monthYear}`;
      if (!acc[key]) {
        acc[key] = {
          location: item.location,
          teacherName: item.teacherName,
          monthYear: item.monthYear,
          totalSessions: 0,
          totalCustomers: 0,
          totalPaid: 0,
          emptySession: 0,
          nonEmptySession: 0,
          classAvgWithEmpty: 0,
          classAvgWithoutEmpty: 0,
          fillRate: 0,
          cancelRate: 0,
          revenuePerSession: 0,
          utilizationRate: 0,
          trends: {}
        };
      }

      const entry = acc[key];
      entry.totalSessions += item.totalSessions || 0;
      entry.totalCustomers += item.totalCustomers || 0;
      entry.totalPaid += item.totalPaid || 0;
      entry.emptySession += item.totalEmptySessions || 0;
      entry.nonEmptySession += item.totalNonEmptySessions || 0;

      return acc;
    }, {} as Record<string, ProcessedPayrollData>);

    // Calculate derived metrics and trends
    const results = Object.values(grouped).map(item => {
      const totalCapacity = item.totalSessions * 15; // Assuming average capacity
      item.classAvgWithEmpty = item.totalSessions > 0 ? item.totalCustomers / item.totalSessions : 0;
      item.classAvgWithoutEmpty = item.nonEmptySession > 0 ? item.totalCustomers / item.nonEmptySession : 0;
      item.fillRate = totalCapacity > 0 ? (item.totalCustomers / totalCapacity) * 100 : 0;
      item.cancelRate = item.totalSessions > 0 ? (item.emptySession / item.totalSessions) * 100 : 0;
      item.revenuePerSession = item.totalSessions > 0 ? item.totalPaid / item.totalSessions : 0;
      item.utilizationRate = item.totalSessions > 0 ? ((item.totalSessions - item.emptySession) / item.totalSessions) * 100 : 0;

      // Calculate trends (month-on-month)
      const currentMonth = new Date(item.monthYear + '-01');
      const previousMonth = new Date(currentMonth);
      previousMonth.setMonth(previousMonth.getMonth() - 1);
      const prevMonthKey = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;
      
      const prevData = Object.values(grouped).find(p => 
        p.location === item.location && 
        p.teacherName === item.teacherName && 
        p.monthYear === prevMonthKey
      );

      if (prevData) {
        item.trends = {
          sessionsChange: prevData.totalSessions > 0 ? ((item.totalSessions - prevData.totalSessions) / prevData.totalSessions) * 100 : 0,
          customersChange: prevData.totalCustomers > 0 ? ((item.totalCustomers - prevData.totalCustomers) / prevData.totalCustomers) * 100 : 0,
          revenueChange: prevData.totalPaid > 0 ? ((item.totalPaid - prevData.totalPaid) / prevData.totalPaid) * 100 : 0,
          fillRateChange: item.fillRate - prevData.fillRate
        };
      }

      return item;
    });

    // Sort data
    return results.sort((a, b) => {
      const aVal = a[sortBy as keyof ProcessedPayrollData];
      const bVal = b[sortBy as keyof ProcessedPayrollData];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      return sortDirection === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });
  }, [data, location, sortBy, sortDirection]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    return sortDirection === 'asc' 
      ? <TrendingUp className="ml-1 h-3 w-3" />
      : <TrendingDown className="ml-1 h-3 w-3" />;
  };

  const renderTrendTooltip = (row: ProcessedPayrollData) => (
    <div className="space-y-1 text-xs">
      <p>Sessions: {formatPercentage(row.trends.sessionsChange || 0)} MoM</p>
      <p>Customers: {formatPercentage(row.trends.customersChange || 0)} MoM</p>
      <p>Revenue: {formatPercentage(row.trends.revenueChange || 0)} MoM</p>
      <p>Fill Rate: {(row.trends.fillRateChange || 0).toFixed(1)}pp MoM</p>
    </div>
  );

  const getMetricValue = (row: ProcessedPayrollData, metric: string) => {
    switch (metric) {
      case 'totalSessions':
        return formatNumber(row.totalSessions);
      case 'totalCustomers':
        return formatNumber(row.totalCustomers);
      case 'totalPaid':
        return formatCurrency(row.totalPaid);
      case 'classAvgWithEmpty':
        return row.classAvgWithEmpty.toFixed(1);
      case 'classAvgWithoutEmpty':
        return row.classAvgWithoutEmpty.toFixed(1);
      case 'fillRate':
        return formatPercentage(row.fillRate);
      case 'cancelRate':
        return formatPercentage(row.cancelRate);
      case 'revenuePerSession':
        return formatCurrency(row.revenuePerSession);
      case 'utilizationRate':
        return formatPercentage(row.utilizationRate);
      default:
        return '-';
    }
  };

  const getMetricColor = (row: ProcessedPayrollData, metric: string) => {
    switch (metric) {
      case 'fillRate':
        return row.fillRate >= 70 ? 'text-green-700' : row.fillRate >= 50 ? 'text-yellow-600' : 'text-red-600';
      case 'cancelRate':
        return row.cancelRate <= 10 ? 'text-green-700' : row.cancelRate <= 20 ? 'text-yellow-600' : 'text-red-600';
      case 'utilizationRate':
        return row.utilizationRate >= 80 ? 'text-green-700' : row.utilizationRate >= 60 ? 'text-yellow-600' : 'text-red-600';
      case 'totalPaid':
      case 'revenuePerSession':
        return 'text-green-700';
      default:
        return 'text-slate-700';
    }
  };

  const metrics = [
    { id: 'totalSessions', label: 'Total Sessions', icon: Calendar },
    { id: 'totalCustomers', label: 'Total Customers', icon: Users },
    { id: 'totalPaid', label: 'Total Revenue', icon: DollarSign },
    { id: 'classAvgWithEmpty', label: 'Avg w/ Empty', icon: BarChart3 },
    { id: 'classAvgWithoutEmpty', label: 'Avg w/o Empty', icon: Target },
    { id: 'fillRate', label: 'Fill Rate', icon: Activity },
    { id: 'cancelRate', label: 'Cancel Rate', icon: TrendingDown },
    { id: 'revenuePerSession', label: 'Revenue/Session', icon: DollarSign },
    { id: 'utilizationRate', label: 'Utilization Rate', icon: Target }
  ];

  if (!data || data.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardContent className="p-6 text-center">
          <p className="text-slate-600">No payroll data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="overflow-hidden border-0 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Improved Payroll Performance Analysis
                {location && location !== 'all' && (
                  <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                    {location}
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-white/80 mt-1">
                Advanced metrics with trend analysis and interactive controls
              </p>
            </div>
            <AdvancedExportButton 
              payrollData={data}
              defaultFileName="improved-payroll-analysis"
              size="sm"
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="w-full">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <TabsList className="grid grid-cols-3 lg:grid-cols-9 w-full lg:w-auto">
                {metrics.map(metric => (
                  <TabsTrigger 
                    key={metric.id} 
                    value={metric.id} 
                    className="flex items-center gap-1 text-xs"
                  >
                    <metric.icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{metric.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">View Mode</Label>
                  <Select value={viewMode} onValueChange={setViewMode}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="instructor">By Instructor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {metrics.map(metric => (
              <TabsContent key={metric.id} value={metric.id}>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow className="hover:bg-slate-50">
                        <TableHead 
                          className="cursor-pointer text-slate-700 font-semibold hover:bg-slate-100"
                          onClick={() => handleSort('location')}
                        >
                          <div className="flex items-center">
                            Location {getSortIcon('location')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer text-slate-700 font-semibold hover:bg-slate-100"
                          onClick={() => handleSort('teacherName')}
                        >
                          <div className="flex items-center">
                            Instructor {getSortIcon('teacherName')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer text-slate-700 font-semibold hover:bg-slate-100"
                          onClick={() => handleSort('monthYear')}
                        >
                          <div className="flex items-center">
                            Month/Year {getSortIcon('monthYear')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer text-slate-700 font-semibold text-center hover:bg-slate-100"
                          onClick={() => handleSort(metric.id)}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <metric.icon className="w-4 h-4" />
                            {metric.label} {getSortIcon(metric.id)}
                          </div>
                        </TableHead>
                        <TableHead className="text-slate-700 font-semibold text-center">
                          Trend Analysis
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedData.map((row, index) => (
                        <TableRow key={index} className="hover:bg-slate-50 transition-colors">
                          <TableCell className="font-medium text-slate-900">
                            {row.location}
                          </TableCell>
                          <TableCell className="text-slate-700">
                            {row.teacherName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-slate-700">
                              {row.monthYear}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={`font-semibold cursor-help ${getMetricColor(row, metric.id)}`}>
                                  {getMetricValue(row, metric.id)}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {renderTrendTooltip(row)}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="text-center">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-center">
                                  {(row.trends.sessionsChange || 0) > 0 ? (
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                  ) : (row.trends.sessionsChange || 0) < 0 ? (
                                    <TrendingDown className="w-4 h-4 text-red-600" />
                                  ) : (
                                    <div className="w-4 h-4 border border-slate-300 rounded-full" />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {renderTrendTooltip(row)}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};