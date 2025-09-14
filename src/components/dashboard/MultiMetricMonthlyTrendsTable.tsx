import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AdvancedExportButton } from '@/components/ui/AdvancedExportButton';
import { UniformTrainerTable } from './UniformTrainerTable';
import { Calendar, Clock, MapPin, Users, Target, Activity, TrendingUp, BarChart3 } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { SessionData } from '@/hooks/useSessionsData';
import { PayrollData } from '@/types/dashboard';

interface MultiMetricMonthlyTrendsTableProps {
  data: SessionData[];
  payrollData: PayrollData[];
  location?: string;
}

interface TrendData {
  dimension: string;
  type: 'timeslot' | 'format' | 'trainer' | 'location' | 'dayOfWeek';
  totalSessions: number;
  totalAttendance: number;
  totalRevenue: number;
  avgFillRate: number;
  avgUtilization: number;
  momSessionsChange: number;
  momAttendanceChange: number;
  momRevenueChange: number;
  monthlyBreakdown: Record<string, {
    sessions: number;
    attendance: number;
    revenue: number;
    fillRate: number;
  }>;
}

export const MultiMetricMonthlyTrendsTable: React.FC<MultiMetricMonthlyTrendsTableProps> = ({
  data,
  payrollData,
  location
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('totalSessions');
  const [activeTrendView, setActiveTrendView] = useState<string>('timeslot');
  const [sortField, setSortField] = useState<string>('totalSessions');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const processedTrendData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Get all unique months from the data
    const allMonths = [...new Set(data.map(session => {
      const date = new Date(session.date);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }))].sort();

    const trendMap: Record<string, TrendData> = {};

    data.forEach(session => {
      const date = new Date(session.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      let dimensionKey: string;
      let dimensionType: TrendData['type'];

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
          totalSessions: 0,
          totalAttendance: 0,
          totalRevenue: 0,
          avgFillRate: 0,
          avgUtilization: 0,
          momSessionsChange: 0,
          momAttendanceChange: 0,
          momRevenueChange: 0,
          monthlyBreakdown: {}
        };
      }

      const trend = trendMap[dimensionKey];
      
      // Initialize monthly breakdown if not exists
      if (!trend.monthlyBreakdown[monthKey]) {
        trend.monthlyBreakdown[monthKey] = {
          sessions: 0,
          attendance: 0,
          revenue: 0,
          fillRate: 0
        };
      }

      // Update totals
      trend.totalSessions += 1;
      trend.totalAttendance += session.checkedInCount || 0;
      trend.totalRevenue += session.totalPaid || 0;

      // Update monthly breakdown
      const monthData = trend.monthlyBreakdown[monthKey];
      monthData.sessions += 1;
      monthData.attendance += session.checkedInCount || 0;
      monthData.revenue += session.totalPaid || 0;
      monthData.fillRate = session.capacity ? (monthData.attendance / (monthData.sessions * session.capacity)) * 100 : 0;
    });

    // Calculate derived metrics and month-on-month changes
    const results = Object.values(trendMap).map(trend => {
      // Calculate averages
      trend.avgFillRate = trend.totalSessions > 0 ? (trend.totalAttendance / (trend.totalSessions * 15)) * 100 : 0; // Assuming avg capacity of 15
      trend.avgUtilization = trend.totalSessions > 0 ? 
        (Object.values(trend.monthlyBreakdown).filter(m => m.sessions > 0).length / allMonths.length) * 100 : 0;

      // Calculate month-on-month changes (comparing latest two months)
      const months = Object.keys(trend.monthlyBreakdown).sort();
      if (months.length >= 2) {
        const latest = trend.monthlyBreakdown[months[months.length - 1]];
        const previous = trend.monthlyBreakdown[months[months.length - 2]];

        trend.momSessionsChange = previous.sessions > 0 ? 
          ((latest.sessions - previous.sessions) / previous.sessions) * 100 : 0;
        trend.momAttendanceChange = previous.attendance > 0 ? 
          ((latest.attendance - previous.attendance) / previous.attendance) * 100 : 0;
        trend.momRevenueChange = previous.revenue > 0 ? 
          ((latest.revenue - previous.revenue) / previous.revenue) * 100 : 0;
      }

      return trend;
    });

    // Sort results
    return results.sort((a, b) => {
      const aVal = a[sortField as keyof TrendData];
      const bVal = b[sortField as keyof TrendData];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      return sortDirection === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });
  }, [data, activeTrendView, sortField, sortDirection]);

  const getColumns = () => {
    const baseColumns = [
      {
        key: 'dimension',
        header: getDimensionHeader(),
        render: (value: string, row: TrendData) => (
          <div className="flex flex-col min-w-[180px]">
            <span className="font-semibold text-slate-900">{value}</span>
            <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
              {getIconForType(row.type)}
              <span className="capitalize">{row.type}</span>
            </div>
          </div>
        ),
        sortable: true,
        width: '200px'
      }
    ];

    // Add metric-specific columns based on selected metric
    const metricColumns = getMetricColumns();
    return [...baseColumns, ...metricColumns];
  };

  const getDimensionHeader = () => {
    switch (activeTrendView) {
      case 'timeslot': return 'Time Slot & Day';
      case 'format': return 'Class Format';
      case 'trainer': return 'Trainer';
      case 'location': return 'Location';
      case 'dayOfWeek': return 'Day of Week';
      default: return 'Dimension';
    }
  };

  const getIconForType = (type: TrendData['type']) => {
    switch (type) {
      case 'timeslot': return <Clock className="w-3 h-3" />;
      case 'format': return <Target className="w-3 h-3" />;
      case 'trainer': return <Users className="w-3 h-3" />;
      case 'location': return <MapPin className="w-3 h-3" />;
      case 'dayOfWeek': return <Calendar className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  const getMetricColumns = () => {
    const commonColumns = [
      {
        key: 'totalSessions',
        header: 'Total Sessions',
        render: (value: number, row: TrendData) => (
          <div className="text-center">
            <div className="font-medium">{formatNumber(value)}</div>
            <div className="text-xs text-slate-500">
              {row.momSessionsChange !== 0 && (
                <Badge className={row.momSessionsChange > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {row.momSessionsChange > 0 ? '+' : ''}{row.momSessionsChange.toFixed(1)}%
                </Badge>
              )}
            </div>
          </div>
        ),
        align: 'center' as const,
        sortable: true,
        width: '130px'
      },
      {
        key: 'totalAttendance',
        header: 'Total Attendance',
        render: (value: number, row: TrendData) => (
          <div className="text-center">
            <div className="font-medium text-blue-700">{formatNumber(value)}</div>
            <div className="text-xs text-slate-500">
              {row.momAttendanceChange !== 0 && (
                <Badge className={row.momAttendanceChange > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {row.momAttendanceChange > 0 ? '+' : ''}{row.momAttendanceChange.toFixed(1)}%
                </Badge>
              )}
            </div>
          </div>
        ),
        align: 'center' as const,
        sortable: true,
        width: '140px'
      },
      {
        key: 'totalRevenue',
        header: 'Total Revenue',
        render: (value: number, row: TrendData) => (
          <div className="text-center">
            <div className="font-medium text-green-700">{formatCurrency(value)}</div>
            <div className="text-xs text-slate-500">
              {row.momRevenueChange !== 0 && (
                <Badge className={row.momRevenueChange > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {row.momRevenueChange > 0 ? '+' : ''}{row.momRevenueChange.toFixed(1)}%
                </Badge>
              )}
            </div>
          </div>
        ),
        align: 'center' as const,
        sortable: true,
        width: '140px'
      },
      {
        key: 'avgFillRate',
        header: 'Avg Fill Rate',
        render: (value: number) => (
          <div className="text-center">
            <Badge className={
              value >= 70 ? 'bg-green-100 text-green-800' :
              value >= 50 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }>
              {formatPercentage(value)}
            </Badge>
          </div>
        ),
        align: 'center' as const,
        sortable: true,
        width: '120px'
      },
      {
        key: 'avgUtilization',
        header: 'Utilization Rate',
        render: (value: number) => (
          <div className="text-center">
            <Badge className={
              value >= 80 ? 'bg-blue-100 text-blue-800' :
              value >= 60 ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }>
              {formatPercentage(value)}
            </Badge>
          </div>
        ),
        align: 'center' as const,
        sortable: true,
        width: '130px'
      }
    ];

    return commonColumns;
  };

  const metrics = [
    { id: 'totalSessions', label: 'Sessions', icon: Calendar },
    { id: 'totalAttendance', label: 'Attendance', icon: Users },
    { id: 'totalRevenue', label: 'Revenue', icon: TrendingUp },
    { id: 'avgFillRate', label: 'Fill Rate', icon: Target },
    { id: 'avgUtilization', label: 'Utilization', icon: Activity }
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
      <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Multi-Metric Monthly Trends
              <Badge variant="secondary" className="bg-white/20 text-white">
                {processedTrendData.length} entries
              </Badge>
            </CardTitle>
            <AdvancedExportButton filename={`monthly-trends-${activeTrendView}`} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label className="text-white text-sm font-medium">Primary Metric</Label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {metrics.map(metric => (
                    <SelectItem key={metric.id} value={metric.id}>
                      <div className="flex items-center gap-2">
                        <metric.icon className="w-4 h-4" />
                        {metric.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <UniformTrainerTable
                data={processedTrendData}
                columns={getColumns()}
                loading={false}
                stickyHeader={true}
                maxHeight="600px"
                headerGradient="from-indigo-600 to-purple-600"
                onSort={(field) => {
                  setSortField(field);
                  setSortDirection(sortField === field && sortDirection === 'desc' ? 'asc' : 'desc');
                }}
                sortField={sortField}
                sortDirection={sortDirection}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};