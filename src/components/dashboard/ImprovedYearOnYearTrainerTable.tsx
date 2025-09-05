
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Calendar, ChevronDown, ChevronRight, Info, Users } from 'lucide-react';
import { TrainerMetricType } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { TrainerMetricTabs } from './TrainerMetricTabs';
import { ProcessedTrainerData, getMetricValue } from './TrainerDataProcessor';

interface ImprovedYearOnYearTrainerTableProps {
  data: ProcessedTrainerData[];
  defaultMetric?: TrainerMetricType;
  onRowClick?: (trainer: string, data: any) => void;
}

export const ImprovedYearOnYearTrainerTable = ({ 
  data, 
  defaultMetric = 'totalSessions',
  onRowClick 
}: ImprovedYearOnYearTrainerTableProps) => {
  const [selectedMetric, setSelectedMetric] = useState<TrainerMetricType>(defaultMetric);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Process data by trainer and month for year-on-year comparison
  const processedData = useMemo(() => {
    const trainerGroups: Record<string, Record<string, ProcessedTrainerData>> = {};
    const monthSet = new Set<string>();

    // Group data by trainer
    data.forEach(record => {
      if (!trainerGroups[record.trainerName]) {
        trainerGroups[record.trainerName] = {};
      }
      trainerGroups[record.trainerName][record.monthYear] = record;
      monthSet.add(record.monthYear);
    });

    // Sort months for year-on-year comparison (group by month across years)
    const months = Array.from(monthSet).sort((a, b) => {
      const parseMonth = (monthStr: string) => {
        // Handle MM/YYYY or Month-Year formats
        if (monthStr.includes('/')) {
          const [monthNum, year] = monthStr.split('/');
          return { month: parseInt(monthNum), year: parseInt(year) };
        } else {
          const parts = monthStr.split('-');
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthNum = monthNames.indexOf(parts[0]) + 1;
          const year = parseInt(parts[1]);
          return { month: monthNum, year };
        }
      };

      const dateA = parseMonth(a);
      const dateB = parseMonth(b);
      
      // Sort by month first, then by year
      if (dateA.month !== dateB.month) {
        return dateA.month - dateB.month;
      }
      return dateA.year - dateB.year;
    });

    // Create organized month pairs for comparison
    const organizedMonths: { display: string; key: string; year: number; monthNum: number }[] = [];
    const monthGroups: Record<number, string[]> = {};

    months.forEach(monthStr => {
      const parseMonth = (monthString: string) => {
        if (monthString.includes('/')) {
          const [m, y] = monthString.split('/');
          return { month: parseInt(m), year: parseInt(y) };
        } else {
          const parts = monthString.split('-');
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const m = monthNames.indexOf(parts[0]) + 1;
          const y = parseInt(parts[1]);
          return { month: m, year: y };
        }
      };

      const { month: monthNumber, year } = parseMonth(monthStr);
      if (!monthGroups[monthNumber]) {
        monthGroups[monthNumber] = [];
      }
      monthGroups[monthNumber].push(monthStr);
    });

    // Create alternating year display for better comparison
    Object.entries(monthGroups).forEach(([monthNumber, monthsInGroup]) => {
      monthsInGroup.sort().forEach(monthStr => {
        const parseMonth = (monthString: string) => {
          if (monthString.includes('/')) {
            const [m, y] = monthString.split('/');
            return { month: parseInt(m), year: parseInt(y) };
          } else {
            const parts = monthString.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const m = monthNames.indexOf(parts[0]) + 1;
            const y = parseInt(parts[1]);
            return { month: m, year: y };
          }
        };

        const { month: monthNum, year } = parseMonth(monthStr);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        organizedMonths.push({
          display: `${monthNames[monthNum - 1]} ${year}`,
          key: monthStr,
          year,
          monthNum
        });
      });
    });

    return { trainerGroups, organizedMonths };
  }, [data]);

  const formatValue = (value: number, metric: TrainerMetricType) => {
    switch (metric) {
      case 'totalPaid':
      case 'cycleRevenue':
      case 'barreRevenue':
        return formatCurrency(value);
      case 'retention':
      case 'conversion':
        return `${value.toFixed(1)}%`;
      case 'classAverageExclEmpty':
      case 'classAverageInclEmpty':
        return value.toFixed(1);
      default:
        return formatNumber(value);
    }
  };

  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const toggleRowExpansion = (trainer: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(trainer)) {
      newExpanded.delete(trainer);
    } else {
      newExpanded.add(trainer);
    }
    setExpandedRows(newExpanded);
  };

  const handleRowClick = (trainer: string) => {
    const trainerData = processedData.trainerGroups[trainer];
    if (onRowClick) {
      onRowClick(trainer, {
        name: trainer,
        monthlyData: trainerData,
        organizedMonths: processedData.organizedMonths
      });
    }
  };

  // Calculate totals for each month
  const monthlyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    processedData.organizedMonths.forEach(({ display, key }) => {
      let monthTotal = 0;
      Object.values(processedData.trainerGroups).forEach(trainerData => {
        if (trainerData[key]) {
          monthTotal += getMetricValue(trainerData[key], selectedMetric);
        }
      });
      totals[display] = monthTotal;
    });
    
    return totals;
  }, [processedData, selectedMetric]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const allValues = Object.values(monthlyTotals);
    const total = allValues.reduce((sum, val) => sum + val, 0);
    const average = allValues.length > 0 ? total / allValues.length : 0;
    const growth = allValues.length >= 2 ? 
      getChangePercentage(allValues[allValues.length - 1], allValues[allValues.length - 2]) : 0;

    return { total, average, growth };
  }, [monthlyTotals]);

  if (!data.length) {
    return (
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardContent className="p-6">
          <p className="text-center text-slate-600">No trainer data available for year-on-year comparison</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Year-on-Year Trainer Performance Analysis
          </CardTitle>
          <p className="text-sm text-gray-600">
            Monthly comparison across different years for {Object.keys(processedData.trainerGroups).length} trainers
          </p>
          <TrainerMetricTabs value={selectedMetric} onValueChange={setSelectedMetric} />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 z-20 bg-gradient-to-r from-blue-700 to-blue-900">
              <TableRow>
                <TableHead className="font-bold text-white sticky left-0 bg-blue-800 z-30 min-w-[200px]">
                  Trainer
                </TableHead>
                {processedData.organizedMonths.map(({ display }) => (
                  <TableHead key={display} className="text-center font-bold text-white min-w-[120px] border-l border-blue-600">
                    <div className="flex flex-col">
                      <span className="text-sm">{display.split(' ')[0]}</span>
                      <span className="text-blue-200 text-xs">{display.split(' ')[1]}</span>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-center font-bold text-white min-w-[100px]">YoY Growth</TableHead>
                <TableHead className="text-center font-bold text-white min-w-[120px]">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Totals Row */}
              <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 font-bold">
                <TableCell className="font-bold text-blue-800 sticky left-0 bg-gradient-to-r from-blue-50 to-purple-50 z-10">
                  TOTAL
                </TableCell>
                {processedData.organizedMonths.map(({ display }) => (
                  <TableCell key={`total-${display}`} className="text-center font-bold text-blue-800">
                    {formatValue(monthlyTotals[display] || 0, selectedMetric)}
                  </TableCell>
                ))}
                <TableCell className="text-center">
                  <Badge className={cn(
                    "flex items-center gap-1",
                    summaryStats.growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  )}>
                    {summaryStats.growth >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(summaryStats.growth).toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-center font-bold text-blue-800">
                  {formatValue(summaryStats.total, selectedMetric)}
                </TableCell>
              </TableRow>

              {/* Trainer Rows */}
              {Object.entries(processedData.trainerGroups).map(([trainer, trainerData]) => {
                const isExpanded = expandedRows.has(trainer);
                const values = processedData.organizedMonths.map(({ key }) => {
                  return trainerData[key] ? getMetricValue(trainerData[key], selectedMetric) : 0;
                });
                
                const trainerTotal = values.reduce((sum, val) => sum + val, 0);
                const growth = values.length >= 2 ? getChangePercentage(values[values.length - 1], values[values.length - 2]) : 0;
                
                return (
                  <React.Fragment key={trainer}>
                    <TableRow 
                      className="hover:bg-slate-50/50 transition-colors border-b cursor-pointer"
                      onClick={() => handleRowClick(trainer)}
                    >
                      <TableCell className="font-medium text-slate-800 sticky left-0 bg-white z-10 border-r">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpansion(trainer);
                            }}
                            className="p-1 h-6 w-6"
                          >
                            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          </Button>
                          <span className="text-sm">{trainer}</span>
                        </div>
                      </TableCell>
                      {values.map((value, index) => (
                        <TableCell key={`${trainer}-${index}`} className="text-center font-mono text-sm">
                          {formatValue(value, selectedMetric)}
                        </TableCell>
                      ))}
                      <TableCell className="text-center">
                        <Badge
                          className={cn(
                            "flex items-center gap-1 w-fit mx-auto",
                            growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          )}
                        >
                          {growth >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {Math.abs(growth).toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-bold text-slate-700">
                        {formatValue(trainerTotal, selectedMetric)}
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Row Details */}
                    {isExpanded && (
                      <TableRow className="bg-slate-50">
                        <TableCell colSpan={processedData.organizedMonths.length + 3} className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="bg-white p-3 rounded-lg shadow-sm border">
                              <p className="text-slate-600 text-xs font-medium">Average per Month</p>
                              <p className="font-bold text-slate-800 text-lg">
                                {formatValue(trainerTotal / processedData.organizedMonths.length, selectedMetric)}
                              </p>
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm border">
                              <p className="text-slate-600 text-xs font-medium">Best Performance</p>
                              <p className="font-bold text-green-600 text-lg">
                                {formatValue(Math.max(...values), selectedMetric)}
                              </p>
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm border">
                              <p className="text-slate-600 text-xs font-medium">Growth Trend</p>
                              <p className={cn(
                                "font-bold text-lg",
                                growth >= 0 ? "text-green-600" : "text-red-600"
                              )}>
                                {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                              </p>
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm border">
                              <p className="text-slate-600 text-xs font-medium">Total Contribution</p>
                              <p className="font-bold text-blue-600 text-lg">
                                {((trainerTotal / summaryStats.total) * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Footer Summary Section */}
        <div className="bg-gradient-to-r from-slate-50 to-white border-t p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Performance Summary
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(processedData.trainerGroups).length}
              </div>
              <div className="text-sm text-slate-600">Active Trainers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {formatValue(summaryStats.total, selectedMetric)}
              </div>
              <div className="text-sm text-slate-600">Total {selectedMetric}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatValue(summaryStats.average, selectedMetric)}
              </div>
              <div className="text-sm text-slate-600">Monthly Average</div>
            </div>
            <div className="text-center">
              <div className={cn(
                "text-2xl font-bold",
                summaryStats.growth >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {summaryStats.growth >= 0 ? '+' : ''}{summaryStats.growth.toFixed(1)}%
              </div>
              <div className="text-sm text-slate-600">Overall Growth</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
