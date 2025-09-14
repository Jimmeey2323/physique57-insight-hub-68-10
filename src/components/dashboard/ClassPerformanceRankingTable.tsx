import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, ChevronRight, Calendar, Users, DollarSign, Target, Activity, MapPin, Clock, Trophy, Eye, User } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { SessionData } from '@/hooks/useSessionsData';

interface ClassPerformanceRankingTableProps {
  data: SessionData[];
  location?: string;
}

export const ClassPerformanceRankingTable: React.FC<ClassPerformanceRankingTableProps> = ({
  data,
  location
}) => {
  const [sortBy, setSortBy] = useState<string>('totalSessions');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [minSessions, setMinSessions] = useState(2);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group data by cleanedClass/classType
    const grouped = data.reduce((acc, session) => {
      const classType = session.cleanedClass || session.classType || 'Unknown';
      
      // Filter out hosted classes and classes below minimum sessions
      if (classType.toLowerCase().includes('hosted')) return acc;
      
      if (!acc[classType]) {
        acc[classType] = {
          classType,
          totalSessions: 0,
          totalCapacity: 0,
          totalCheckedIn: 0,
          totalRevenue: 0,
          totalBooked: 0,
          emptySessionsCount: 0,
          revenueGeneratingSessions: 0,
          sessions: [] // Store individual sessions
        };
      }

      const classData = acc[classType];
      classData.totalSessions += 1;
      classData.totalCapacity += session.capacity || 0;
      classData.totalCheckedIn += session.checkedInCount || 0;
      classData.totalRevenue += session.totalPaid || 0;
      classData.totalBooked += session.bookedCount || 0;
      classData.sessions.push(session); // Store the session

      if ((session.checkedInCount || 0) === 0) {
        classData.emptySessionsCount += 1;
      }

      if ((session.totalPaid || 0) > 0) {
        classData.revenueGeneratingSessions += 1;
      }

      return acc;
    }, {} as Record<string, any>);

    // Filter out classes with sessions < minSessions
    const filteredData = Object.values(grouped).filter((classData: any) => 
      classData.totalSessions >= minSessions
    );

    // Calculate additional metrics
    const enrichedData = filteredData.map((classData: any) => ({
      ...classData,
      fillRate: classData.totalCapacity > 0 ? (classData.totalCheckedIn / classData.totalCapacity) * 100 : 0,
      showUpRate: classData.totalBooked > 0 ? (classData.totalCheckedIn / classData.totalBooked) * 100 : 0,
      avgRevenue: classData.totalSessions > 0 ? classData.totalRevenue / classData.totalSessions : 0,
      revenuePerAttendee: classData.totalCheckedIn > 0 ? classData.totalRevenue / classData.totalCheckedIn : 0,
      utilizationRate: classData.totalSessions > 0 ? ((classData.totalSessions - classData.emptySessionsCount) / classData.totalSessions) * 100 : 0,
      avgClassSize: classData.totalSessions > 0 ? classData.totalCheckedIn / classData.totalSessions : 0,
      emptySessionRate: classData.totalSessions > 0 ? (classData.emptySessionsCount / classData.totalSessions) * 100 : 0,
      revenueEfficiency: classData.totalSessions > 0 ? (classData.revenueGeneratingSessions / classData.totalSessions) * 100 : 0
    }));

    // Sort data
    return enrichedData.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [data, sortBy, sortDirection, minSessions]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const toggleRowExpansion = (classType: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(classType)) {
      newExpanded.delete(classType);
    } else {
      newExpanded.add(classType);
    }
    setExpandedRows(newExpanded);
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  if (!data || data.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardContent className="p-6 text-center">
          <p className="text-slate-600">No class performance data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-0 rounded-2xl overflow-hidden bg-white">
      <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Class Performance Rankings
              <Badge variant="secondary" className="bg-white/20 text-white">
                {processedData.length} classes
              </Badge>
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white">
              <label htmlFor="minSessions" className="text-sm font-medium">
                Min Sessions:
              </label>
              <select
                id="minSessions"
                value={minSessions}
                onChange={(e) => setMinSessions(Number(e.target.value))}
                className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm backdrop-blur-sm"
              >
                <option value={1} className="text-black">1+</option>
                <option value={2} className="text-black">2+</option>
                <option value={5} className="text-black">5+</option>
                <option value={10} className="text-black">10+</option>
                <option value={20} className="text-black">20+</option>
              </select>
            </div>
            
            <div className="text-white/80 text-sm">
              Excludes hosted classes • Shows classes with {minSessions}+ sessions • Click rows to expand
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-[700px] overflow-x-auto overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-20 bg-slate-50">
              <TableRow className="border-b-2 border-slate-200">
                <TableHead className="sticky left-0 bg-slate-50 z-30 border-r border-slate-200 min-w-[200px]">
                  <Button variant="ghost" onClick={() => handleSort('classType')} className="font-bold text-slate-700 p-0 h-auto whitespace-nowrap">
                    Class Type {getSortIcon('classType')}
                  </Button>
                </TableHead>
                <TableHead className="text-center min-w-[100px]">
                  <Button variant="ghost" onClick={() => handleSort('totalSessions')} className="font-bold text-slate-700 p-0 h-auto whitespace-nowrap">
                    <Calendar className="w-4 h-4 mr-1" />
                    Sessions {getSortIcon('totalSessions')}
                  </Button>
                </TableHead>
                <TableHead className="text-center min-w-[100px]">
                  <Button variant="ghost" onClick={() => handleSort('totalCapacity')} className="font-bold text-slate-700 p-0 h-auto whitespace-nowrap">
                    <Users className="w-4 h-4 mr-1" />
                    Capacity {getSortIcon('totalCapacity')}
                  </Button>
                </TableHead>
                <TableHead className="text-center min-w-[120px]">
                  <Button variant="ghost" onClick={() => handleSort('totalCheckedIn')} className="font-bold text-slate-700 p-0 h-auto whitespace-nowrap">
                    <Activity className="w-4 h-4 mr-1" />
                    Attendance {getSortIcon('totalCheckedIn')}
                  </Button>
                </TableHead>
                <TableHead className="text-center min-w-[100px]">
                  <Button variant="ghost" onClick={() => handleSort('fillRate')} className="font-bold text-slate-700 p-0 h-auto whitespace-nowrap">
                    <Target className="w-4 h-4 mr-1" />
                    Fill Rate {getSortIcon('fillRate')}
                  </Button>
                </TableHead>
                <TableHead className="text-center min-w-[120px]">
                  <Button variant="ghost" onClick={() => handleSort('showUpRate')} className="font-bold text-slate-700 p-0 h-auto whitespace-nowrap">
                    Show-up Rate {getSortIcon('showUpRate')}
                  </Button>
                </TableHead>
                <TableHead className="text-center min-w-[120px]">
                  <Button variant="ghost" onClick={() => handleSort('avgRevenue')} className="font-bold text-slate-700 p-0 h-auto whitespace-nowrap">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Avg Revenue {getSortIcon('avgRevenue')}
                  </Button>
                </TableHead>
                <TableHead className="text-center min-w-[120px]">
                  <Button variant="ghost" onClick={() => handleSort('totalRevenue')} className="font-bold text-slate-700 p-0 h-auto whitespace-nowrap">
                    Total Revenue {getSortIcon('totalRevenue')}
                  </Button>
                </TableHead>
                <TableHead className="text-center min-w-[120px]">
                  <Button variant="ghost" onClick={() => handleSort('utilizationRate')} className="font-bold text-slate-700 p-0 h-auto whitespace-nowrap">
                    Utilization {getSortIcon('utilizationRate')}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedData.map((row, index) => (
                <React.Fragment key={row.classType}>
                  <TableRow 
                    className="cursor-pointer transition-colors border-b hover:bg-slate-50"
                    onClick={() => toggleRowExpansion(row.classType)}
                  >
                    <TableCell className="sticky left-0 bg-white z-10 border-r border-slate-200 font-semibold">
                      <div className="flex items-center gap-2 whitespace-nowrap min-w-[180px]">
                        {index + 1 <= 3 && (
                          <Trophy className={`w-4 h-4 ${index + 1 === 1 ? 'text-yellow-500' : index + 1 === 2 ? 'text-gray-400' : 'text-amber-600'}`} />
                        )}
                        {expandedRows.has(row.classType) ? 
                          <ChevronDown className="w-4 h-4 text-blue-600" /> : 
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        }
                        <span className="font-medium">{row.classType}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium whitespace-nowrap">
                      {formatNumber(row.totalSessions)}
                    </TableCell>
                    <TableCell className="text-center font-medium whitespace-nowrap">
                      {formatNumber(row.totalCapacity)}
                    </TableCell>
                    <TableCell className="text-center font-medium whitespace-nowrap">
                      {formatNumber(row.totalCheckedIn)}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <Badge 
                        className={
                          row.fillRate >= 80 ? 'bg-green-100 text-green-800' :
                          row.fillRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {formatPercentage(row.fillRate)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <Badge 
                        className={
                          row.showUpRate >= 90 ? 'bg-green-100 text-green-800' :
                          row.showUpRate >= 75 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {formatPercentage(row.showUpRate)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium text-green-700 whitespace-nowrap">
                      {formatCurrency(row.avgRevenue)}
                    </TableCell>
                    <TableCell className="text-center font-bold text-green-800 whitespace-nowrap">
                      {formatCurrency(row.totalRevenue)}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <Badge 
                        className={
                          row.utilizationRate >= 80 ? 'bg-blue-100 text-blue-800' :
                          row.utilizationRate >= 60 ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {formatPercentage(row.utilizationRate)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  
                  {expandedRows.has(row.classType) && (
                    <TableRow>
                      <TableCell colSpan={9} className="p-0 bg-slate-50/50">
                        <div className="p-4">
                          <div className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Individual Sessions for {row.classType} ({row.sessions.length} total)
                          </div>
                          <div className="max-h-64 overflow-auto bg-white rounded-lg border">
                            <Table>
                              <TableHeader className="sticky top-0 bg-slate-100">
                                <TableRow>
                                  <TableHead className="text-xs whitespace-nowrap">Date</TableHead>
                                  <TableHead className="text-xs whitespace-nowrap">Time</TableHead>
                                  <TableHead className="text-xs whitespace-nowrap">Trainer</TableHead>
                                  <TableHead className="text-xs whitespace-nowrap">Location</TableHead>
                                  <TableHead className="text-xs text-center whitespace-nowrap">Capacity</TableHead>
                                  <TableHead className="text-xs text-center whitespace-nowrap">Checked In</TableHead>
                                  <TableHead className="text-xs text-center whitespace-nowrap">Fill Rate</TableHead>
                                  <TableHead className="text-xs text-center whitespace-nowrap">Revenue</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {row.sessions.slice(0, 20).map((session: any, sessionIndex: number) => (
                                  <TableRow key={sessionIndex} className="text-xs">
                                    <TableCell className="whitespace-nowrap">{session.date}</TableCell>
                                    <TableCell className="whitespace-nowrap">
                                      <Badge variant="outline" className="text-xs">
                                        {session.time}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">{session.trainerName}</TableCell>
                                    <TableCell className="whitespace-nowrap text-slate-600">{session.location}</TableCell>
                                    <TableCell className="text-center whitespace-nowrap">{session.capacity}</TableCell>
                                    <TableCell className="text-center whitespace-nowrap">{session.checkedInCount}</TableCell>
                                    <TableCell className="text-center whitespace-nowrap">
                                      <Badge 
                                        variant="outline"
                                        className={`text-xs ${
                                          (session.fillPercentage || 0) >= 80 ? 'border-green-200 text-green-700' :
                                          (session.fillPercentage || 0) >= 60 ? 'border-yellow-200 text-yellow-700' :
                                          'border-red-200 text-red-700'
                                        }`}
                                      >
                                        {formatPercentage(session.fillPercentage || 0)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-center text-green-600 whitespace-nowrap">
                                      {formatCurrency(session.totalPaid || 0)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            {row.sessions.length > 20 && (
                              <div className="p-2 text-center text-xs text-slate-500 border-t">
                                Showing first 20 of {row.sessions.length} sessions
                              </div>
                            )}
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
      </CardContent>
    </Card>
  );
};