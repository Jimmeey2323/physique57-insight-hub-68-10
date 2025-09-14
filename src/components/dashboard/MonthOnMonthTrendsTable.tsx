import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdvancedExportButton } from '@/components/ui/AdvancedExportButton';
import { Calendar, Clock, MapPin, Users, Target, Activity, TrendingUp, BarChart3, ChevronDown, ChevronRight } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { SessionData } from '@/hooks/useSessionsData';
import { PayrollData } from '@/types/dashboard';

interface MonthOnMonthTrendsTableProps {
  data: SessionData[];
  payrollData: PayrollData[];
  location?: string;
}

interface MonthlyTrendData {
  dimension: string;
  type: 'timeslot' | 'format' | 'trainer' | 'location' | 'dayOfWeek';
  [monthKey: string]: any;
  totalValues: {
    avgVisits: number;
    sessions: number;
    attendance: number;
    revenue: number;
    fillRate: number;
  };
}

export const MonthOnMonthTrendsTable: React.FC<MonthOnMonthTrendsTableProps> = ({
  data,
  payrollData,
  location
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('avgVisits');
  const [activeTrendView, setActiveTrendView] = useState<string>('timeslot');
  const [minSessions, setMinSessions] = useState(5);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<string>('totalValues.avgVisits');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { processedData, allMonths } = useMemo(() => {
    if (!data || data.length === 0) return { processedData: [], allMonths: [] };

    // Get all unique months from the data
    const monthsSet = new Set(data.map(session => {
      const date = new Date(session.date);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }));
    const sortedMonths = Array.from(monthsSet).sort();

    const trendMap: Record<string, MonthlyTrendData> = {};

    data.forEach(session => {
      const date = new Date(session.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      let dimensionKey: string;
      let dimensionType: MonthlyTrendData['type'];

      switch (activeTrendView) {
        case 'timeslot':
          dimensionKey = `${session.time} (${session.dayOfWeek})`;
          dimensionType = 'timeslot';
          break;
        case 'format':
          dimensionKey = session.cleanedClass || session.classType || 'Unknown';
          dimensionType = 'format';
          break;
        case 'trainer':
          dimensionKey = session.trainerName || 'Unknown';
          dimensionType = 'trainer';
          break;
        case 'location':
          dimensionKey = session.location || 'Unknown';
          dimensionType = 'location';
          break;
        case 'dayOfWeek':
          dimensionKey = session.dayOfWeek || 'Unknown';
          dimensionType = 'dayOfWeek';
          break;
        default:
          dimensionKey = 'Unknown';
          dimensionType = 'timeslot';
      }

      if (!trendMap[dimensionKey]) {
        trendMap[dimensionKey] = {
          dimension: dimensionKey,
          type: dimensionType,
          totalValues: {
            avgVisits: 0,
            sessions: 0,
            attendance: 0,
            revenue: 0,
            fillRate: 0
          }
        };

        // Initialize all months
        sortedMonths.forEach(month => {
          trendMap[dimensionKey][month] = {
            sessions: 0,
            attendance: 0,
            revenue: 0,
            fillRate: 0,
            avgVisits: 0
          };
        });
      }

      const trend = trendMap[dimensionKey];
      
      // Update monthly data
      if (!trend[monthKey]) {
        trend[monthKey] = {
          sessions: 0,
          attendance: 0,
          revenue: 0,
          fillRate: 0,
          avgVisits: 0
        };
      }

      const monthData = trend[monthKey];
      monthData.sessions += 1;
      monthData.attendance += session.checkedInCount || 0;
      monthData.revenue += session.totalPaid || 0;
      
      // Update totals
      trend.totalValues.sessions += 1;
      trend.totalValues.attendance += session.checkedInCount || 0;
      trend.totalValues.revenue += session.totalPaid || 0;
    });

    // Calculate derived metrics
    const results = Object.values(trendMap).map(trend => {
      // Calculate totals and averages
      trend.totalValues.avgVisits = trend.totalValues.sessions > 0 ? 
        trend.totalValues.attendance / trend.totalValues.sessions : 0;
      trend.totalValues.fillRate = trend.totalValues.sessions > 0 ? 
        (trend.totalValues.attendance / (trend.totalValues.sessions * 15)) * 100 : 0; // Assuming avg capacity of 15

      // Calculate monthly averages
      sortedMonths.forEach(month => {
        const monthData = trend[month];
        if (monthData.sessions > 0) {
          monthData.avgVisits = monthData.attendance / monthData.sessions;
          monthData.fillRate = (monthData.attendance / (monthData.sessions * 15)) * 100;
        }
      });

      return trend;
    });

    // Filter by minimum sessions
    const filteredResults = results.filter(trend => trend.totalValues.sessions >= minSessions);

    // Sort results
    const sortedResults = filteredResults.sort((a, b) => {
      const getValue = (obj: any, path: string) => {
        return path.split('.').reduce((o, p) => o && o[p], obj);
      };
      
      const aVal = getValue(a, sortField);
      const bVal = getValue(b, sortField);
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      return sortDirection === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });

    return { processedData: sortedResults, allMonths: sortedMonths };
  }, [data, activeTrendView, minSessions, sortField, sortDirection]);

  const toggleRowExpansion = (dimension: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(dimension)) {
      newExpanded.delete(dimension);
    } else {
      newExpanded.add(dimension);
    }
    setExpandedRows(newExpanded);
  };

  const getMetricValue = (data: any, metric: string) => {
    switch (metric) {
      case 'avgVisits':
        return data.avgVisits?.toFixed(1) || '0.0';
      case 'sessions':
        return formatNumber(data.sessions || 0);
      case 'attendance':
        return formatNumber(data.attendance || 0);
      case 'revenue':
        return formatCurrency(data.revenue || 0);
      case 'fillRate':
        return formatPercentage(data.fillRate || 0);
      default:
        return '-';
    }
  };

  const getMetricColor = (value: number, metric: string) => {
    switch (metric) {
      case 'avgVisits':
        return value >= 8 ? 'text-green-700' : value >= 5 ? 'text-yellow-600' : 'text-red-600';
      case 'fillRate':
        return value >= 70 ? 'text-green-700' : value >= 50 ? 'text-yellow-600' : 'text-red-600';
      case 'revenue':
        return 'text-green-700';
      default:
        return 'text-slate-700';
    }
  };

  const getIconForType = (type: MonthlyTrendData['type']) => {
    switch (type) {
      case 'timeslot': return <Clock className="w-3 h-3" />;
      case 'format': return <Target className="w-3 h-3" />;
      case 'trainer': return <Users className="w-3 h-3" />;
      case 'location': return <MapPin className="w-3 h-3" />;
      case 'dayOfWeek': return <Calendar className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  const metrics = [
    { id: 'avgVisits', label: 'Average Visits', icon: Users },
    { id: 'sessions', label: 'Sessions', icon: Calendar },
    { id: 'attendance', label: 'Attendance', icon: Users },
    { id: 'revenue', label: 'Revenue', icon: TrendingUp },
    { id: 'fillRate', label: 'Fill Rate', icon: Target }
  ];

  const trendViews = [
    { id: 'timeslot', label: 'Time Slots', icon: Clock },
    { id: 'format', label: 'Class Formats', icon: Target },
    { id: 'trainer', label: 'Trainers', icon: Users },
    { id: 'location', label: 'Locations', icon: MapPin },
    { id: 'dayOfWeek', label: 'Days of Week', icon: Calendar }
  ];

  return (
    <Card className="shadow-xl border-0 rounded-2xl overflow-hidden bg-white">
      <CardHeader className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 text-white">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2 text-white">
              <BarChart3 className="w-6 h-6" />
              Month-on-Month Performance Trends
              <Badge variant="secondary" className="bg-white/20 text-white">
                {processedData.length} entries
              </Badge>
            </CardTitle>
            <AdvancedExportButton 
              additionalData={{ monthlyTrendsData: processedData }}
              payrollData={payrollData}
              defaultFileName={`month-on-month-trends-${activeTrendView}`}
              size="sm"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-white text-sm font-medium">Analysis Dimension</Label>
              <Select value={activeTrendView} onValueChange={setActiveTrendView}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {trendViews.map(view => (
                    <SelectItem key={view.id} value={view.id}>
                      <div className="flex items-center gap-2">
                        <view.icon className="w-4 h-4" />
                        {view.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm font-medium">Min Sessions</Label>
              <Select value={minSessions.toString()} onValueChange={(value) => setMinSessions(Number(value))}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                  <SelectItem value="10">10+</SelectItem>
                  <SelectItem value="20">20+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedMetric('avgVisits');
                  setActiveTrendView('timeslot');
                  setMinSessions(5);
                }}
                className="bg-white/20 text-white hover:bg-white/30 border-white/30"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="w-full">
          <div className="border-b border-slate-200 px-6 py-4">
            <TabsList className="grid grid-cols-5 w-full max-w-2xl">
              {metrics.map(metric => (
                <TabsTrigger 
                  key={metric.id} 
                  value={metric.id}
                  className="flex items-center gap-1 text-xs"
                >
                  <metric.icon className="w-3 h-3" />
                  {metric.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {metrics.map(metric => (
            <TabsContent key={metric.id} value={metric.id} className="mt-0">
              <div className="overflow-x-auto max-h-[600px]">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-slate-100">
                    <TableRow className="hover:bg-slate-100">
                      <TableHead className="sticky left-0 z-20 bg-slate-100 text-slate-800 font-semibold w-[200px] border-r border-slate-300">
                        {activeTrendView === 'timeslot' ? 'Time Slot & Day' :
                         activeTrendView === 'format' ? 'Class Format' :
                         activeTrendView === 'trainer' ? 'Trainer' :
                         activeTrendView === 'location' ? 'Location' :
                         'Day of Week'}
                      </TableHead>
                      <TableHead className="text-slate-800 font-semibold text-center w-[120px]">
                        Total {metric.label}
                      </TableHead>
                      {allMonths.map(month => (
                        <TableHead key={month} className="text-slate-800 font-semibold text-center min-w-[100px]">
                          {new Date(month + '-01').toLocaleDateString('en-US', { 
                            month: 'short', 
                            year: '2-digit' 
                          })}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedData.map((row, index) => (
                      <React.Fragment key={index}>
                        <TableRow 
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => toggleRowExpansion(row.dimension)}
                        >
                          <TableCell className="sticky left-0 z-10 bg-white border-r border-slate-200 font-medium">
                            <div className="flex items-center gap-2">
                              {expandedRows.has(row.dimension) ? 
                                <ChevronDown className="w-4 h-4 text-slate-500" /> : 
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                              }
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-900">{row.dimension}</span>
                                <div className="flex items-center gap-1 text-xs text-slate-600">
                                  {getIconForType(row.type)}
                                  <span className="capitalize">{row.type}</span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className={`font-semibold ${getMetricColor(row.totalValues[metric.id as keyof typeof row.totalValues], metric.id)}`}>
                              {getMetricValue(row.totalValues, metric.id)}
                            </div>
                          </TableCell>
                          {allMonths.map(month => (
                            <TableCell key={month} className="text-center">
                              <div className={`font-medium ${getMetricColor(row[month]?.[metric.id] || 0, metric.id)}`}>
                                {getMetricValue(row[month] || {}, metric.id)}
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                        
                        {expandedRows.has(row.dimension) && (
                          <TableRow className="bg-slate-50/50">
                            <TableCell colSpan={allMonths.length + 2} className="py-4">
                              <div className="ml-8 space-y-2">
                                <h4 className="font-semibold text-slate-800">Drill-down Analytics for {row.dimension}</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-slate-600">Total Sessions:</span>
                                    <span className="font-medium ml-2">{formatNumber(row.totalValues.sessions)}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-600">Total Attendance:</span>
                                    <span className="font-medium ml-2">{formatNumber(row.totalValues.attendance)}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-600">Total Revenue:</span>
                                    <span className="font-medium ml-2">{formatCurrency(row.totalValues.revenue)}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-600">Average Fill Rate:</span>
                                    <span className="font-medium ml-2">{formatPercentage(row.totalValues.fillRate)}</span>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};