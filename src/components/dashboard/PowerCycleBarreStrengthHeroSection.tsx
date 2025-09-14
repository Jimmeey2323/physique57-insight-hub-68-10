import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Zap, Bike, Dumbbell } from 'lucide-react';
import { ProcessedTrainerData } from './TrainerDataProcessor';
import { formatNumber, formatCurrency } from '@/utils/formatters';

interface PowerCycleBarreStrengthHeroSectionProps {
  data: ProcessedTrainerData[];
}

export const PowerCycleBarreStrengthHeroSection: React.FC<PowerCycleBarreStrengthHeroSectionProps> = ({ data }) => {
  // Calculate aggregate metrics
  const totalSessions = data.reduce((sum, trainer) => sum + trainer.totalSessions, 0);
  const totalRevenue = data.reduce((sum, trainer) => sum + trainer.totalPaid, 0);
  const totalCustomers = data.reduce((sum, trainer) => sum + trainer.totalCustomers, 0);
  const totalTrainers = data.length;

  // Calculate format-specific metrics
  const cycleSessions = data.reduce((sum, trainer) => sum + trainer.cycleSessions, 0);
  const cycleRevenue = data.reduce((sum, trainer) => sum + trainer.cycleRevenue, 0);
  const barreSessions = data.reduce((sum, trainer) => sum + trainer.barreSessions, 0);
  const barreRevenue = data.reduce((sum, trainer) => sum + trainer.barreRevenue, 0);
  const strengthSessions = data.reduce((sum, trainer) => sum + trainer.strengthSessions, 0);
  const strengthRevenue = data.reduce((sum, trainer) => sum + trainer.strengthRevenue, 0);

  // Calculate averages and performance indicators
  const avgSessionsPerTrainer = totalTrainers > 0 ? totalSessions / totalTrainers : 0;
  const avgRevenuePerSession = totalSessions > 0 ? totalRevenue / totalSessions : 0;
  const avgCustomersPerSession = totalSessions > 0 ? totalCustomers / totalSessions : 0;

  // Determine top performing format
  const formatPerformance = [
    { name: 'PowerCycle', sessions: cycleSessions, revenue: cycleRevenue, icon: Zap, color: 'blue' },
    { name: 'Barre', sessions: barreSessions, revenue: barreRevenue, icon: Bike, color: 'pink' },
    { name: 'Strength Lab', sessions: strengthSessions, revenue: strengthRevenue, icon: Dumbbell, color: 'green' }
  ].sort((a, b) => b.revenue - a.revenue);

  const topFormat = formatPerformance[0];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      
      <div className="relative container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            PowerCycle vs Barre vs Strength Lab
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive performance analysis across all class formats
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Sessions */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium">Total Sessions</p>
                  <p className="text-3xl font-bold text-white">{formatNumber(totalSessions)}</p>
                  <p className="text-blue-400 text-sm mt-1">
                    Avg {formatNumber(avgSessionsPerTrainer)}/trainer
                  </p>
                </div>
                <Activity className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
                  <p className="text-green-400 text-sm mt-1">
                    {formatCurrency(avgRevenuePerSession)}/session
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          {/* Total Customers */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium">Total Customers</p>
                  <p className="text-3xl font-bold text-white">{formatNumber(totalCustomers)}</p>
                  <p className="text-purple-400 text-sm mt-1">
                    Avg {formatNumber(avgCustomersPerSession)}/session
                  </p>
                </div>
                <Activity className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          {/* Active Trainers */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium">Active Trainers</p>
                  <p className="text-3xl font-bold text-white">{formatNumber(totalTrainers)}</p>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 mt-2">
                    All Formats
                  </Badge>
                </div>
                <Activity className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Format Performance Comparison */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <topFormat.icon className={`w-6 h-6 text-${topFormat.color}-400`} />
              Format Performance Overview
              <Badge className={`bg-${topFormat.color}-500/20 text-${topFormat.color}-400 border-${topFormat.color}-500/30 ml-2`}>
                {topFormat.name} Leading
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {formatPerformance.map((format, index) => {
                const Icon = format.icon;
                const isTop = index === 0;
                
                return (
                  <div key={format.name} className={`relative p-4 rounded-lg ${
                    isTop ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' 
                          : 'bg-white/5 border border-white/10'
                  }`}>
                    {isTop && (
                      <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-900 border-0">
                        #1
                      </Badge>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className={`w-6 h-6 text-${format.color}-400`} />
                      <h3 className="text-lg font-semibold text-white">{format.name}</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Sessions:</span>
                        <span className="text-white font-medium">{formatNumber(format.sessions)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Revenue:</span>
                        <span className="text-white font-medium">{formatCurrency(format.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Market Share:</span>
                        <span className={`text-${format.color}-400 font-medium`}>
                          {totalSessions > 0 ? Math.round((format.sessions / totalSessions) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};