import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AdvancedExportButton } from '@/components/ui/AdvancedExportButton';
import { UniformTrainerTable } from './UniformTrainerTable';
import { BarChart3, Settings, Target, Users, Calendar, Activity, TrendingUp, DollarSign, Zap } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { SessionData } from '@/hooks/useSessionsData';

interface EnhancedClassFormatPerformanceTableProps {
  data: SessionData[];
  location?: string;
}

interface ClassFormatData {
  classFormat: string;
  totalSessions: number;
  emptySessions: number;
  nonEmptySessions: number;
  totalCheckedIn: number;
  totalLateCancelled: number;
  totalBooked: number;
  totalCapacity: number;
  totalRevenue: number;
  revenueGeneratingSessions: number;
  avgClassSize: number;
  avgRevenue: number;
  fillRate: number;
  showUpRate: number;
  utilizationRate: number;
  cancellationRate: number;
  revenueEfficiency: number;
  revenuePerAttendee: number;
  emptySessionRate: number;
  sessions: SessionData[];
}

export const EnhancedClassFormatPerformanceTable: React.FC<EnhancedClassFormatPerformanceTableProps> = ({
  data,
  location
}) => {
  const [sortBy, setSortBy] = useState<string>('totalSessions');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [minSessions, setMinSessions] = useState(2);
  const [viewFilter, setViewFilter] = useState<string>('all');
  const [metricFocus, setMetricFocus] = useState<string>('comprehensive');

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group data by class format (cleanedClass/classType)
    const grouped = data.reduce((acc, session) => {
      const classFormat = session.cleanedClass || session.classType || 'Unknown';
      
      // Filter out hosted classes
      if (classFormat.toLowerCase().includes('hosted')) return acc;
      
      if (!acc[classFormat]) {
        acc[classFormat] = {
          classFormat,
          totalSessions: 0,
          emptySessions: 0,
          nonEmptySessions: 0,
          totalCheckedIn: 0,
          totalLateCancelled: 0,
          totalBooked: 0,
          totalCapacity: 0,
          totalRevenue: 0,
          revenueGeneratingSessions: 0,
          avgClassSize: 0,
          avgRevenue: 0,
          fillRate: 0,
          showUpRate: 0,
          utilizationRate: 0,
          cancellationRate: 0,
          revenueEfficiency: 0,
          revenuePerAttendee: 0,
          emptySessionRate: 0,
          sessions: []
        };
      }

      const classData = acc[classFormat];
      classData.totalSessions += 1;
      classData.totalCapacity += session.capacity || 0;
      classData.totalCheckedIn += session.checkedInCount || 0;
      classData.totalRevenue += session.totalPaid || 0;
      classData.totalBooked += session.bookedCount || 0;
      classData.totalLateCancelled += session.lateCancelledCount || 0;
      classData.sessions.push(session);

      if ((session.checkedInCount || 0) === 0) {
        classData.emptySessions += 1;
      } else {
        classData.nonEmptySessions += 1;
      }

      if ((session.totalPaid || 0) > 0) {
        classData.revenueGeneratingSessions += 1;
      }

      return acc;
    }, {} as Record<string, ClassFormatData>);

    // Filter and calculate metrics
    const enrichedData = Object.values(grouped)
      .filter((classData: ClassFormatData) => classData.totalSessions >= minSessions)
      .map((classData: ClassFormatData) => ({
        ...classData,
        avgClassSize: classData.totalSessions > 0 ? classData.totalCheckedIn / classData.totalSessions : 0,
        avgRevenue: classData.totalSessions > 0 ? classData.totalRevenue / classData.totalSessions : 0,
        fillRate: classData.totalCapacity > 0 ? (classData.totalCheckedIn / classData.totalCapacity) * 100 : 0,
        showUpRate: classData.totalBooked > 0 ? (classData.totalCheckedIn / classData.totalBooked) * 100 : 0,
        utilizationRate: classData.totalSessions > 0 ? ((classData.totalSessions - classData.emptySessions) / classData.totalSessions) * 100 : 0,
        cancellationRate: classData.totalBooked > 0 ? (classData.totalLateCancelled / classData.totalBooked) * 100 : 0,
        revenueEfficiency: classData.totalSessions > 0 ? (classData.revenueGeneratingSessions / classData.totalSessions) * 100 : 0,
        revenuePerAttendee: classData.totalCheckedIn > 0 ? classData.totalRevenue / classData.totalCheckedIn : 0,
        emptySessionRate: classData.totalSessions > 0 ? (classData.emptySessions / classData.totalSessions) * 100 : 0
      }));

    // Apply view filter
    let filteredData = enrichedData;
    switch (viewFilter) {
      case 'high-performing':
        filteredData = enrichedData.filter(d => d.fillRate >= 70 && d.utilizationRate >= 80);
        break;
      case 'needs-attention':
        filteredData = enrichedData.filter(d => d.fillRate < 50 || d.emptySessionRate > 30);
        break;
      case 'revenue-generators':
        filteredData = enrichedData.filter(d => d.revenueEfficiency >= 80);
        break;
      default:
        filteredData = enrichedData;
    }

    // Sort data
    return filteredData.sort((a, b) => {
      const aVal = a[sortBy as keyof ClassFormatData];
      const bVal = b[sortBy as keyof ClassFormatData];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      return sortDirection === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });
  }, [data, sortBy, sortDirection, minSessions, viewFilter]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const getColumns = () => {
    const baseColumns = [
      {
        key: 'classFormat',
        header: 'Class Format',
        render: (value: string, row: ClassFormatData) => (
          <div className="flex flex-col min-w-[160px]">
            <span className="font-semibold text-slate-900">{value}</span>
            <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
              <Activity className="w-3 h-3" />
              {formatPercentage(row.utilizationRate)} utilized
            </div>
          </div>
        ),
        sortable: true,
        width: '180px'
      },
      {
        key: 'totalSessions',
        header: 'Sessions',
        render: (value: number, row: ClassFormatData) => (
          <div className="text-center">
            <div className="font-medium">{formatNumber(value)}</div>
            <div className="text-xs text-slate-500">{row.nonEmptySessions} active</div>
          </div>
        ),
        align: 'center' as const,
        sortable: true,
        width: '100px'
      },
      {
        key: 'totalCheckedIn',
        header: 'Total Attendance',
        render: (value: number, row: ClassFormatData) => (
          <div className="text-center">
            <div className="font-medium text-blue-700">{formatNumber(value)}</div>
            <div className="text-xs text-slate-500">{row.avgClassSize.toFixed(1)} avg</div>
          </div>
        ),
        align: 'center' as const,
        sortable: true,
        width: '130px'
      },
      {
        key: 'fillRate',
        header: 'Fill Rate',
        render: (value: number) => (
          <div className="text-center">
            <Badge className={
              value >= 80 ? 'bg-green-100 text-green-800' :
              value >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }>
              {formatPercentage(value)}
            </Badge>
          </div>
        ),
        align: 'center' as const,
        sortable: true,
        width: '100px'
      },
      {
        key: 'showUpRate',
        header: 'Show-up Rate',
        render: (value: number) => (
          <div className="text-center">
            <Badge className={
              value >= 90 ? 'bg-green-100 text-green-800' :
              value >= 75 ? 'bg-yellow-100 text-yellow-800' :
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
        key: 'totalRevenue',
        header: 'Total Revenue',
        render: (value: number, row: ClassFormatData) => (
          <div className="text-center">
            <div className="font-medium text-green-700">{formatCurrency(value)}</div>
            <div className="text-xs text-slate-500">{formatCurrency(row.avgRevenue)} avg</div>
          </div>
        ),
        align: 'center' as const,
        sortable: true,
        width: '130px'
      },
      {
        key: 'revenuePerAttendee',
        header: 'Revenue/Attendee',
        render: (value: number) => (
          <div className="text-center font-medium text-green-600">{formatCurrency(value)}</div>
        ),
        align: 'center' as const,
        sortable: true,
        width: '140px'
      },
      {
        key: 'cancellationRate',
        header: 'Cancel Rate',
        render: (value: number) => (
          <div className="text-center">
            <Badge className={
              value <= 10 ? 'bg-green-100 text-green-800' :
              value <= 20 ? 'bg-yellow-100 text-yellow-800' :
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
        key: 'emptySessionRate',
        header: 'Empty Rate',
        render: (value: number, row: ClassFormatData) => (
          <div className="text-center">
            <div className="text-sm font-medium text-red-600">{formatPercentage(value)}</div>
            <div className="text-xs text-slate-500">{row.emptySessions} sessions</div>
          </div>
        ),
        align: 'center' as const,
        sortable: true,
        width: '110px'
      },
      {
        key: 'revenueEfficiency',
        header: 'Revenue Efficiency',
        render: (value: number, row: ClassFormatData) => (
          <div className="text-center">
            <Badge className={
              value >= 80 ? 'bg-blue-100 text-blue-800' :
              value >= 60 ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }>
              {formatPercentage(value)}
            </Badge>
            <div className="text-xs text-slate-500 mt-1">{row.revenueGeneratingSessions} sessions</div>
          </div>
        ),
        align: 'center' as const,
        sortable: true,
        width: '150px'
      }
    ];

    // Add specialized columns based on metric focus
    if (metricFocus === 'capacity') {
      baseColumns.splice(3, 0, {
        key: 'totalCapacity',
        header: 'Total Capacity',
        render: (value: number) => (
          <div className="text-center font-medium text-slate-600">{formatNumber(value)}</div>
        ),
        align: 'center' as const,
        sortable: true,
        width: '120px'
      });
    }

    if (metricFocus === 'bookings') {
      baseColumns.splice(4, 0, {
        key: 'totalBooked',
        header: 'Total Bookings',
        render: (value: number) => (
          <div className="text-center font-medium text-indigo-700">{formatNumber(value)}</div>
        ),
        align: 'center' as const,
        sortable: true,
        width: '130px'
      });
    }

    return baseColumns;
  };

  const viewFilters = [
    { value: 'all', label: 'All Formats' },
    { value: 'high-performing', label: 'High Performing' },
    { value: 'needs-attention', label: 'Needs Attention' },
    { value: 'revenue-generators', label: 'Revenue Generators' }
  ];

  const metricFocusOptions = [
    { value: 'comprehensive', label: 'Comprehensive' },
    { value: 'capacity', label: 'Capacity Focus' },
    { value: 'bookings', label: 'Bookings Focus' },
    { value: 'revenue', label: 'Revenue Focus' }
  ];

  return (
    <Card className="shadow-xl border-0 rounded-2xl overflow-hidden bg-white">
      <CardHeader className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Enhanced Class Format Performance
              <Badge variant="secondary" className="bg-white/20 text-white">
                {processedData.length} formats
              </Badge>
            </CardTitle>
            <AdvancedExportButton 
              additionalData={{ classFormatData: processedData }}
              defaultFileName="class-format-performance"
              size="sm"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-white text-sm font-medium">View Filter</Label>
              <Select value={viewFilter} onValueChange={setViewFilter}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {viewFilters.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm font-medium">Metric Focus</Label>
              <Select value={metricFocus} onValueChange={setMetricFocus}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {metricFocusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
                  <SelectItem value="2">2+</SelectItem>
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
                  setSortBy('totalSessions');
                  setSortDirection('desc');
                  setMinSessions(2);
                  setViewFilter('all');
                  setMetricFocus('comprehensive');
                }}
                className="bg-white/20 text-white hover:bg-white/30 border-white/30"
              >
                <Settings className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <UniformTrainerTable
          data={processedData}
          columns={getColumns()}
          loading={false}
          stickyHeader={true}
          maxHeight="700px"
          headerGradient="from-emerald-600 to-teal-600"
          onSort={handleSort}
          sortField={sortBy}
          sortDirection={sortDirection}
        />
      </CardContent>
    </Card>
  );
};