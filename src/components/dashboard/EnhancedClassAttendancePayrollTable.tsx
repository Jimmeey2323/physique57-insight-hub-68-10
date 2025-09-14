import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Minus, Info, Download, ArrowUpDown } from 'lucide-react';
import { PayrollData } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface EnhancedClassAttendancePayrollTableProps {
  data: PayrollData[];
  location?: string;
}

export const EnhancedClassAttendancePayrollTable: React.FC<EnhancedClassAttendancePayrollTableProps> = ({
  data,
  location
}) => {
  const [sortBy, setSortBy] = useState<string>('location');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return { tableData: [], months: [] };

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

    // Get unique months and sort them
    const months = [...new Set(filteredData.map(item => item.monthYear))].sort();

    // Group by location and teacher
    const grouped = filteredData.reduce((acc, item) => {
      const key = `${item.location}-${item.teacherName}`;
      if (!acc[key]) {
        acc[key] = {
          location: item.location,
          teacherName: item.teacherName,
          monthlyData: {} as Record<string, any>,
          totals: {
            totalSessions: 0,
            totalCustomers: 0,
            totalPaid: 0,
            totalEmptySessions: 0,
            totalNonEmptySessions: 0
          }
        };
      }

      const entry = acc[key];
      
      // Store monthly data
      if (!entry.monthlyData[item.monthYear]) {
        entry.monthlyData[item.monthYear] = {
          totalSessions: 0,
          totalCustomers: 0,
          totalPaid: 0,
          emptySession: 0,
          nonEmptySession: 0,
          classAvgWithEmpty: 0,
          classAvgWithoutEmpty: 0,
          fillRate: 0,
          cancelRate: 0
        };
      }

      const monthData = entry.monthlyData[item.monthYear];
      monthData.totalSessions += item.totalSessions || 0;
      monthData.totalCustomers += item.totalCustomers || 0;
      monthData.totalPaid += item.totalPaid || 0;
      monthData.emptySession += item.totalEmptySessions || 0;
      monthData.nonEmptySession += item.totalNonEmptySessions || 0;

      // Calculate derived metrics
      const totalCapacity = monthData.totalSessions * 15;
      monthData.classAvgWithEmpty = monthData.totalSessions > 0 ? 
        Number((monthData.totalCustomers / monthData.totalSessions).toFixed(1)) : 0;
      monthData.classAvgWithoutEmpty = monthData.nonEmptySession > 0 ? 
        Number((monthData.totalCustomers / monthData.nonEmptySession).toFixed(1)) : 0;
      monthData.fillRate = totalCapacity > 0 ? 
        Number((monthData.totalCustomers / totalCapacity * 100).toFixed(1)) : 0;
      monthData.cancelRate = monthData.totalSessions > 0 ? 
        Number((monthData.emptySession / monthData.totalSessions * 100).toFixed(1)) : 0;

      // Update totals
      entry.totals.totalSessions += item.totalSessions || 0;
      entry.totals.totalCustomers += item.totalCustomers || 0;
      entry.totals.totalPaid += item.totalPaid || 0;
      entry.totals.totalEmptySessions += item.totalEmptySessions || 0;
      entry.totals.totalNonEmptySessions += item.totalNonEmptySessions || 0;

      return acc;
    }, {} as Record<string, any>);

    // Convert to array and sort
    const tableData = Object.values(grouped).sort((a: any, b: any) => {
      const aVal = a[sortBy] || a.totals[sortBy] || 0;
      const bVal = b[sortBy] || b.totals[sortBy] || 0;
      
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return { tableData, months };
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
      ? <ArrowUp className="ml-1 h-3 w-3" />
      : <ArrowDown className="ml-1 h-3 w-3" />;
  };

  const getMonthTrend = (currentMonth: any, previousMonth: any, metric: string) => {
    if (!previousMonth || !currentMonth) return null;
    
    const current = currentMonth[metric] || 0;
    const previous = previousMonth[metric] || 0;
    
    if (previous === 0) return null;
    
    const change = ((current - previous) / previous) * 100;
    if (Math.abs(change) < 0.1) return null;
    
    return change;
  };

  const renderTrendIndicator = (change: number | null) => {
    if (change === null) return <Minus className="w-3 h-3 text-gray-400" />;
    
    const isPositive = change > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <Icon className="w-3 h-3" />
        <span className="text-xs font-medium">{Math.abs(change).toFixed(1)}%</span>
      </div>
    );
  };

  if (!data || data.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardContent className="p-6 text-center">
          <p className="text-slate-600">No payroll data available</p>
        </CardContent>
      </Card>
    );
  }

  const { tableData, months } = processedData;

  return (
    <TooltipProvider>
      <Card className="overflow-hidden border-0 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Monthly Payroll Performance Matrix
                {location && location !== 'all' && (
                  <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                    {location}
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-white/80 mt-1">
                Comprehensive month-by-month performance tracking with trends
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 text-gray-800">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-20 bg-slate-100">
                <TableRow className="border-b-2 border-slate-300">
                  {/* Fixed columns */}
                  <TableHead 
                    className="sticky left-0 bg-slate-100 z-30 border-r border-slate-300 cursor-pointer min-w-[150px]"
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center text-xs font-bold text-slate-800 whitespace-nowrap">
                      Location {getSortIcon('location')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="sticky left-[150px] bg-slate-100 z-30 border-r border-slate-300 cursor-pointer min-w-[120px]"
                    onClick={() => handleSort('teacherName')}
                  >
                    <div className="flex items-center text-xs font-bold text-slate-800 whitespace-nowrap">
                      Instructor {getSortIcon('teacherName')}
                    </div>
                  </TableHead>
                  
                  {/* Monthly columns */}
                  {months.map((month) => (
                    <TableHead key={month} className="text-center border-r border-slate-200 min-w-[200px]">
                      <div className="text-xs font-bold text-slate-800 py-2">
                        <div className="mb-1">{month}</div>
                        <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600">
                          <div>Sessions</div>
                          <div>Revenue</div>
                          <div>Attendance</div>
                          <div>Fill Rate</div>
                        </div>
                      </div>
                    </TableHead>
                  ))}
                  
                  {/* Summary columns */}
                  <TableHead 
                    className="text-center bg-slate-200 border-l-2 border-slate-400 cursor-pointer min-w-[120px]"
                    onClick={() => handleSort('totals.totalSessions')}
                  >
                    <div className="flex items-center justify-center text-xs font-bold text-slate-800 whitespace-nowrap">
                      Total Sessions {getSortIcon('totals.totalSessions')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center bg-slate-200 cursor-pointer min-w-[120px]"
                    onClick={() => handleSort('totals.totalPaid')}
                  >
                    <div className="flex items-center justify-center text-xs font-bold text-slate-800 whitespace-nowrap">
                      Total Revenue {getSortIcon('totals.totalPaid')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {tableData.map((row: any, index: number) => (
                  <TableRow key={index} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                    {/* Fixed columns */}
                    <TableCell className="sticky left-0 bg-white z-10 border-r border-slate-200 font-medium text-xs">
                      <div className="whitespace-nowrap min-w-[140px] truncate" title={row.location}>
                        {row.location}
                      </div>
                    </TableCell>
                    <TableCell className="sticky left-[150px] bg-white z-10 border-r border-slate-200 text-xs">
                      <div className="whitespace-nowrap min-w-[110px] truncate font-medium text-slate-700" title={row.teacherName}>
                        {row.teacherName}
                      </div>
                    </TableCell>
                    
                    {/* Monthly data */}
                    {months.map((month, monthIndex) => {
                      const monthData = row.monthlyData[month];
                      const prevMonth = monthIndex > 0 ? row.monthlyData[months[monthIndex - 1]] : null;
                      
                      return (
                        <TableCell key={month} className="text-center border-r border-slate-200 p-2">
                          {monthData ? (
                            <div className="grid grid-cols-2 gap-1 text-[10px]">
                              <div className="flex flex-col items-center">
                                <span className="font-medium text-slate-800">{monthData.totalSessions}</span>
                                {renderTrendIndicator(getMonthTrend(monthData, prevMonth, 'totalSessions'))}
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="font-medium text-green-700 whitespace-nowrap">
                                  {formatCurrency(monthData.totalPaid)}
                                </span>
                                {renderTrendIndicator(getMonthTrend(monthData, prevMonth, 'totalPaid'))}
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="font-medium text-blue-700">{monthData.totalCustomers}</span>
                                {renderTrendIndicator(getMonthTrend(monthData, prevMonth, 'totalCustomers'))}
                              </div>
                              <div className="flex flex-col items-center">
                                <Badge 
                                  className={`text-[9px] px-1 py-0 ${
                                    monthData.fillRate >= 70 ? 'bg-green-100 text-green-800' :
                                    monthData.fillRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {monthData.fillRate}%
                                </Badge>
                                {renderTrendIndicator(getMonthTrend(monthData, prevMonth, 'fillRate'))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-slate-400 text-xs">No data</div>
                          )}
                        </TableCell>
                      );
                    })}
                    
                    {/* Summary columns */}
                    <TableCell className="text-center bg-slate-50 border-l-2 border-slate-400 font-bold text-sm">
                      {formatNumber(row.totals.totalSessions)}
                    </TableCell>
                    <TableCell className="text-center bg-slate-50 font-bold text-sm text-green-700">
                      {formatCurrency(row.totals.totalPaid)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};