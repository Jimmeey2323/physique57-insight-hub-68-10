import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { ProcessedTrainerData } from './TrainerDataProcessor';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Activity, BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

interface PowerCycleBarreStrengthInteractiveChartsProps {
  data: ProcessedTrainerData[];
  onChartClick?: (data: any) => void;
}

const COLORS = {
  cycle: '#3B82F6',    // Blue
  barre: '#EC4899',    // Pink
  strength: '#10B981', // Green
  total: '#8B5CF6'     // Purple
};

export const PowerCycleBarreStrengthInteractiveCharts: React.FC<PowerCycleBarreStrengthInteractiveChartsProps> = ({ 
  data, 
  onChartClick 
}) => {
  const [activeChart, setActiveChart] = useState('overview');

  // Prepare data for different chart types
  const formatDistributionData = React.useMemo(() => {
    const cycleSessions = data.reduce((sum, trainer) => sum + trainer.cycleSessions, 0);
    const barreSessions = data.reduce((sum, trainer) => sum + trainer.barreSessions, 0);
    const strengthSessions = data.reduce((sum, trainer) => sum + trainer.strengthSessions, 0);
    
    return [
      { name: 'PowerCycle', value: cycleSessions, revenue: data.reduce((sum, trainer) => sum + trainer.cycleRevenue, 0), color: COLORS.cycle },
      { name: 'Barre', value: barreSessions, revenue: data.reduce((sum, trainer) => sum + trainer.barreRevenue, 0), color: COLORS.barre },
      { name: 'Strength Lab', value: strengthSessions, revenue: data.reduce((sum, trainer) => sum + trainer.strengthRevenue, 0), color: COLORS.strength }
    ].filter(item => item.value > 0);
  }, [data]);

  const topTrainersData = React.useMemo(() => {
    return data
      .sort((a, b) => b.totalPaid - a.totalPaid)
      .slice(0, 10)
      .map(trainer => ({
        name: trainer.trainerName.split(' ')[0] || trainer.trainerName,
        cycle: trainer.cycleRevenue,
        barre: trainer.barreRevenue,
        strength: trainer.strengthRevenue,
        total: trainer.totalPaid,
        sessions: trainer.totalSessions,
        customers: trainer.totalCustomers
      }));
  }, [data]);

  const monthlyTrendData = React.useMemo(() => {
    const monthlyData = data.reduce((acc, trainer) => {
      const month = trainer.monthYear || 'Unknown';
      if (!acc[month]) {
        acc[month] = { month, cycle: 0, barre: 0, strength: 0, total: 0 };
      }
      acc[month].cycle += trainer.cycleRevenue;
      acc[month].barre += trainer.barreRevenue;
      acc[month].strength += trainer.strengthRevenue;
      acc[month].total += trainer.totalPaid;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(monthlyData).sort((a: any, b: any) => {
      const aDate = new Date(a.month);
      const bDate = new Date(b.month);
      return aDate.getTime() - bDate.getTime();
    });
  }, [data]);

  const performanceMetricsData = React.useMemo(() => {
    return data
      .filter(trainer => trainer.totalSessions > 0)
      .map(trainer => ({
        name: trainer.trainerName.split(' ')[0] || trainer.trainerName,
        conversionRate: trainer.conversionRate,
        retentionRate: trainer.retentionRate,
        utilizationRate: trainer.utilizationRate,
        revenuePerSession: trainer.revenuePerSession,
        fillRate: trainer.fillRate
      }))
      .sort((a, b) => b.revenuePerSession - a.revenuePerSession)
      .slice(0, 15);
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' && entry.value > 1000 ? formatCurrency(entry.value) : formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleChartElementClick = (data: any, chartType: string) => {
    if (onChartClick) {
      onChartClick({ ...data, chartType, source: 'chart' });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Interactive Performance Charts
            <Badge className="bg-white/20 text-white border-white/30 ml-2">
              {data.length} Trainers
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeChart} onValueChange={setActiveChart} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded-lg p-1">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="trainers" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Top Trainers
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Monthly Trends
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Performance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Format Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Format Distribution by Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={formatDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                          onClick={(data) => handleChartElementClick(data, 'pie')}
                          className="cursor-pointer"
                        >
                          {formatDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                      {formatDistributionData.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-sm font-medium">{entry.name}</span>
                          <span className="text-xs text-gray-600">({entry.value} sessions)</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue Distribution by Format</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={formatDistributionData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          dataKey="revenue" 
                          onClick={(data) => handleChartElementClick(data, 'bar')}
                          className="cursor-pointer"
                        >
                          {formatDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trainers" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Performing Trainers by Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={topTrainersData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="cycle" stackId="a" fill={COLORS.cycle} name="PowerCycle" />
                      <Bar dataKey="barre" stackId="a" fill={COLORS.barre} name="Barre" />
                      <Bar dataKey="strength" stackId="a" fill={COLORS.strength} name="Strength Lab" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="cycle" stackId="1" stroke={COLORS.cycle} fill={COLORS.cycle} fillOpacity={0.6} />
                      <Area type="monotone" dataKey="barre" stackId="1" stroke={COLORS.barre} fill={COLORS.barre} fillOpacity={0.6} />
                      <Area type="monotone" dataKey="strength" stackId="1" stroke={COLORS.strength} fill={COLORS.strength} fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trainer Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={performanceMetricsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <Tooltip 
                        content={({ active, payload, label }: any) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                                <p className="font-semibold text-gray-800 mb-2">{label}</p>
                                <p className="text-sm text-blue-600">Conversion: {formatNumber(data.conversionRate)}%</p>
                                <p className="text-sm text-green-600">Retention: {formatNumber(data.retentionRate)}%</p>
                                <p className="text-sm text-purple-600">Utilization: {formatNumber(data.utilizationRate)}%</p>
                                <p className="text-sm text-orange-600">Revenue/Session: {formatCurrency(data.revenuePerSession)}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="conversionRate" fill="#3B82F6" name="Conversion Rate" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};