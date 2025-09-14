import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AdvancedExportButton } from '@/components/ui/AdvancedExportButton';
import { UniformTrainerTable } from './UniformTrainerTable';
import { Trophy, Settings, Filter, Target, Users, Calendar, Clock, MapPin, Activity, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { SessionData } from '@/hooks/useSessionsData';

interface EnhancedClassPerformanceRankingTableProps {
  data: SessionData[];
  location?: string;
}

interface GroupedClassData {
  uniqueId1: string;
  className: string;
  dayOfWeek: string;
  time: string;
  location: string;
  totalSessions: number;
  emptySessions: number;
  nonEmptySessions: number;
  totalCheckedIn: number;
  totalLateCancelled: number;
  totalBooked: number;
  totalCapacity: number;
  totalRevenue: number;
  classAvgWithEmpty: number;
  classAvgWithoutEmpty: number;
  fillRate: number;
  cancellationRate: number;
  showUpRate: number;
  utilizationRate: number;
  revenuePerSession: number;
  revenuePerAttendee: number;
  sessions: SessionData[];
}

export const EnhancedClassPerformanceRankingTable: React.FC<EnhancedClassPerformanceRankingTableProps> = ({
  data,
  location
}) => {
  const [rankingCriteria, setRankingCriteria] = useState<string>('totalSessions');
  const [viewOption, setViewOption] = useState<string>('detailed');
  const [groupingOption, setGroupingOption] = useState<string>('uniqueId1');
  const [minSessions, setMinSessions] = useState(2);
  const [sortField, setSortField] = useState<string>('totalSessions');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group data based on grouping option
    const grouped = data.reduce((acc, session) => {
      let groupKey: string;
      
      switch (groupingOption) {
        case 'uniqueId1':
          groupKey = session.uniqueId1 || 'unknown';
          break;
        case 'timeSlot':
          groupKey = `${session.time}-${session.dayOfWeek}`;
          break;
        case 'location':
          groupKey = session.location || 'unknown';
          break;
        case 'classType':
          groupKey = session.cleanedClass || session.classType || 'unknown';
          break;
        default:
          groupKey = session.uniqueId1 || 'unknown';
      }

      if (!acc[groupKey]) {
        acc[groupKey] = {
          uniqueId1: session.uniqueId1,
          className: session.cleanedClass || session.classType || 'Unknown',
          dayOfWeek: session.dayOfWeek,
          time: session.time,
          location: session.location,
          totalSessions: 0,
          emptySessions: 0,
          nonEmptySessions: 0,
          totalCheckedIn: 0,
          totalLateCancelled: 0,
          totalBooked: 0,
          totalCapacity: 0,
          totalRevenue: 0,
          classAvgWithEmpty: 0,
          classAvgWithoutEmpty: 0,
          fillRate: 0,
          cancellationRate: 0,
          showUpRate: 0,
          utilizationRate: 0,
          revenuePerSession: 0,
          revenuePerAttendee: 0,
          sessions: []
        };
      }

      const classData = acc[groupKey];
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

      return acc;
    }, {} as Record<string, GroupedClassData>);

    // Calculate derived metrics and filter
    const enrichedData = Object.values(grouped)
      .filter((classData: GroupedClassData) => classData.totalSessions >= minSessions)
      .map((classData: GroupedClassData) => ({
        ...classData,
        classAvgWithEmpty: classData.totalSessions > 0 ? classData.totalCheckedIn / classData.totalSessions : 0,
        classAvgWithoutEmpty: classData.nonEmptySessions > 0 ? classData.totalCheckedIn / classData.nonEmptySessions : 0,
        fillRate: classData.totalCapacity > 0 ? (classData.totalCheckedIn / classData.totalCapacity) * 100 : 0,
        cancellationRate: classData.totalBooked > 0 ? (classData.totalLateCancelled / classData.totalBooked) * 100 : 0,
        showUpRate: classData.totalBooked > 0 ? (classData.totalCheckedIn / classData.totalBooked) * 100 : 0,
        utilizationRate: classData.totalSessions > 0 ? ((classData.totalSessions - classData.emptySessions) / classData.totalSessions) * 100 : 0,
        revenuePerSession: classData.totalSessions > 0 ? classData.totalRevenue / classData.totalSessions : 0,
        revenuePerAttendee: classData.totalCheckedIn > 0 ? classData.totalRevenue / classData.totalCheckedIn : 0
      }));

    // Sort by ranking criteria
    return enrichedData.sort((a, b) => {
      const aVal = a[rankingCriteria as keyof GroupedClassData];
      const bVal = b[rankingCriteria as keyof GroupedClassData];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      return sortDirection === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });
  }, [data, groupingOption, minSessions, rankingCriteria, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setRankingCriteria(field);
      setSortDirection('desc');
    }
  };

  const toggleRowExpansion = (uniqueId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(uniqueId)) {
      newExpanded.delete(uniqueId);
    } else {
      newExpanded.add(uniqueId);
    }
    setExpandedRows(newExpanded);
  };

  const getColumns = () => {
    const baseColumns = [
      {
        key: 'className',
        header: 'Class Name',
        render: (value: string, row: GroupedClassData) => (
          <div className="flex flex-col min-w-[180px]">
            <span className="font-semibold text-slate-900">{value}</span>
            <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
              <Calendar className="w-3 h-3" />
              {row.dayOfWeek}
              <Clock className="w-3 h-3 ml-2" />
              {row.time}
            </div>
          </div>
        ),
        sortable: true,
        width: '200px'
      },
      {
        key: 'totalSessions',
        header: 'Sessions',
        render: (value: number) => (
          <div className="text-center font-medium">{formatNumber(value)}</div>
        ),
        align: 'center' as const,
        sortable: true,
        width: '100px'
      },
      {
        key: 'emptySessions',
        header: 'Empty Sessions',
        render: (value: number, row: GroupedClassData) => (
          <div className="text-center">
            <Badge className={value > 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
              {formatNumber(value)}
            </Badge>
          </div>
        ),
        align: 'center' as const,
        sortable: true,
        width: '120px'
      },
      {
        key: 'totalCheckedIn',
        header: 'Check-ins',
        render: (value: number) => (
          <div className="text-center font-medium text-blue-700">{formatNumber(value)}</div>
        ),
        align: 'center' as const,
        sortable: true,
        width: '100px'
      },
      {
        key: 'totalLateCancelled',
        header: 'Late Cancellations',
        render: (value: number) => (
          <div className="text-center">
            <Badge className={value > 10 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
              {formatNumber(value)}
            </Badge>
          </div>
        ),
        align: 'center' as const,
        sortable: true,
        width: '140px'
      },
      {
        key: 'totalBooked',
        header: 'Bookings',
        render: (value: number) => (
          <div className="text-center font-medium">{formatNumber(value)}</div>
        ),
        align: 'center' as const,
        sortable: true,
        width: '100px'
      },
      {
        key: 'totalCapacity',
        header: 'Capacity',
        render: (value: number) => (
          <div className="text-center font-medium text-slate-600">{formatNumber(value)}</div>
        ),
        align: 'center' as const,
        sortable: true,
        width: '100px'
      },
      {
        key: 'classAvgWithEmpty',
        header: 'Avg w/ Empty',
        render: (value: number) => (
          <div className="text-center font-medium text-purple-700">{value.toFixed(1)}</div>
        ),
        align: 'center' as const,
        sortable: true,
        width: '120px'
      },
      {
        key: 'classAvgWithoutEmpty',
        header: 'Avg w/o Empty',
        render: (value: number) => (
          <div className="text-center font-medium text-green-700">{value.toFixed(1)}</div>
        ),
        align: 'center' as const,
        sortable: true,
        width: '120px'
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
      }
    ];

    if (viewOption === 'detailed') {
      baseColumns.push(
        {
          key: 'totalRevenue',
          header: 'Total Revenue',
          render: (value: number) => (
            <div className="text-center font-medium text-green-700">{formatCurrency(value)}</div>
          ),
          align: 'center' as const,
          sortable: true,
          width: '120px'
        },
        {
          key: 'revenuePerSession',
          header: 'Revenue/Session',
          render: (value: number) => (
            <div className="text-center font-medium">{formatCurrency(value)}</div>
          ),
          align: 'center' as const,
          sortable: true,
          width: '130px'
        }
      );
    }

    return baseColumns;
  };

  const rankingOptions = [
    { value: 'totalSessions', label: 'Total Sessions', icon: Calendar },
    { value: 'classAvgWithEmpty', label: 'Class Average', icon: Users },
    { value: 'totalCheckedIn', label: 'Attendance', icon: Activity },
    { value: 'fillRate', label: 'Fill Rate', icon: Target },
    { value: 'cancellationRate', label: 'Cancellation Rate', icon: TrendingUp },
    { value: 'totalRevenue', label: 'Revenue', icon: DollarSign },
    { value: 'utilizationRate', label: 'Utilization', icon: Activity }
  ];

  const viewOptions = [
    { value: 'compact', label: 'Compact View' },
    { value: 'detailed', label: 'Detailed View' },
    { value: 'performance', label: 'Performance Focus' },
    { value: 'revenue', label: 'Revenue Focus' },
    { value: 'utilization', label: 'Utilization Focus' }
  ];

  const groupingOptions = [
    { value: 'uniqueId1', label: 'Class Instance (Unique ID)' },
    { value: 'classType', label: 'Class Format' },
    { value: 'timeSlot', label: 'Time Slot & Day' },
    { value: 'location', label: 'Location' }
  ];

  return (
    <Card className="shadow-xl border-0 rounded-2xl overflow-hidden bg-white">
      <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Enhanced Class Performance Rankings
              <Badge variant="secondary" className="bg-white/20 text-white">
                {processedData.length} classes
              </Badge>
            </CardTitle>
            <AdvancedExportButton filename="class-performance-rankings" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label className="text-white text-sm font-medium">Ranking Criteria</Label>
              <Select value={rankingCriteria} onValueChange={setRankingCriteria}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rankingOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm font-medium">View Option</Label>
              <Select value={viewOption} onValueChange={setViewOption}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {viewOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm font-medium">Grouping</Label>
              <Select value={groupingOption} onValueChange={setGroupingOption}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {groupingOptions.map(option => (
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
                  setRankingCriteria('totalSessions');
                  setViewOption('detailed');
                  setGroupingOption('uniqueId1');
                  setMinSessions(2);
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
          headerGradient="from-slate-600 to-slate-700"
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          onRowClick={(row) => toggleRowExpansion(row.uniqueId1)}
        />
      </CardContent>
    </Card>
  );
};