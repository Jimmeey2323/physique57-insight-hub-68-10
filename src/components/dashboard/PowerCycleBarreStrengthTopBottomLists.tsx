import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProcessedTrainerData } from './TrainerDataProcessor';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { TrendingUp, TrendingDown, Award, Star, Target, Users, Zap, Bike, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PowerCycleBarreStrengthTopBottomListsProps {
  data: ProcessedTrainerData[];
  onItemClick: (itemData: any) => void;
}

export const PowerCycleBarreStrengthTopBottomLists: React.FC<PowerCycleBarreStrengthTopBottomListsProps> = ({ 
  data, 
  onItemClick 
}) => {
  // Calculate various rankings
  const rankings = useMemo(() => {
    // Top performers by total revenue
    const topByRevenue = [...data]
      .sort((a, b) => b.totalPaid - a.totalPaid)
      .slice(0, 5);
    
    const bottomByRevenue = [...data]
      .filter(t => t.totalPaid > 0)
      .sort((a, b) => a.totalPaid - b.totalPaid)
      .slice(0, 5);

    // Top performers by sessions
    const topBySessions = [...data]
      .sort((a, b) => b.totalSessions - a.totalSessions)
      .slice(0, 5);

    // Top performers by format
    const topByPowerCycle = [...data]
      .filter(t => t.cycleRevenue > 0)
      .sort((a, b) => b.cycleRevenue - a.cycleRevenue)
      .slice(0, 5);

    const topByBarre = [...data]
      .filter(t => t.barreRevenue > 0)
      .sort((a, b) => b.barreRevenue - a.barreRevenue)
      .slice(0, 5);

    const topByStrength = [...data]
      .filter(t => t.strengthRevenue > 0)
      .sort((a, b) => b.strengthRevenue - a.strengthRevenue)
      .slice(0, 5);

    // Top by performance metrics
    const topByConversion = [...data]
      .filter(t => t.conversionRate > 0)
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 5);

    const topByRetention = [...data]
      .filter(t => t.retentionRate > 0)
      .sort((a, b) => b.retentionRate - a.retentionRate)
      .slice(0, 5);

    const topByUtilization = [...data]
      .filter(t => t.utilizationRate > 0)
      .sort((a, b) => b.utilizationRate - a.utilizationRate)
      .slice(0, 5);

    return {
      topByRevenue,
      bottomByRevenue,
      topBySessions,
      topByPowerCycle,
      topByBarre,
      topByStrength,
      topByConversion,
      topByRetention,
      topByUtilization
    };
  }, [data]);

  const RankingCard = ({ 
    title, 
    items, 
    icon: Icon, 
    color, 
    valueFormatter, 
    valueKey, 
    subtitleKey,
    isBottom = false 
  }: {
    title: string;
    items: ProcessedTrainerData[];
    icon: any;
    color: string;
    valueFormatter: (value: number) => string;
    valueKey: keyof ProcessedTrainerData;
    subtitleKey?: keyof ProcessedTrainerData;
    isBottom?: boolean;
  }) => (
    <Card className={cn(
      "hover:shadow-lg transition-shadow duration-300",
      isBottom ? "bg-gradient-to-br from-red-50 to-red-100" : `bg-gradient-to-br from-${color}-50 to-${color}-100`
    )}>
      <CardHeader className="pb-3">
        <CardTitle className={cn(
          "flex items-center gap-2 text-lg",
          isBottom ? "text-red-700" : `text-${color}-700`
        )}>
          <Icon className="w-5 h-5" />
          {title}
          {isBottom && <TrendingDown className="w-4 h-4" />}
          {!isBottom && <TrendingUp className="w-4 h-4" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((trainer, index) => (
          <div 
            key={trainer.trainerId}
            className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onItemClick(trainer)}
          >
            <div className="flex items-center gap-3">
              <Badge className={cn(
                "w-6 h-6 flex items-center justify-center p-0 text-xs font-bold",
                index === 0 ? "bg-yellow-500 text-yellow-900" :
                index === 1 ? "bg-gray-400 text-gray-900" :
                index === 2 ? "bg-orange-400 text-orange-900" :
                "bg-gray-200 text-gray-700"
              )}>
                {index + 1}
              </Badge>
              <div>
                <p className="font-semibold text-gray-900">{trainer.trainerName}</p>
                <p className="text-xs text-gray-500">{trainer.location}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={cn(
                "font-bold",
                isBottom ? "text-red-600" : `text-${color}-600`
              )}>
                {valueFormatter(trainer[valueKey] as number)}
              </p>
              {subtitleKey && (
                <p className="text-xs text-gray-500">
                  {typeof trainer[subtitleKey] === 'number' 
                    ? formatNumber(trainer[subtitleKey] as number)
                    : trainer[subtitleKey]
                  }
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Top Performers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <RankingCard
          title="Top Revenue Performers"
          items={rankings.topByRevenue}
          icon={Award}
          color="green"
          valueFormatter={formatCurrency}
          valueKey="totalPaid"
          subtitleKey="totalSessions"
        />

        <RankingCard
          title="Most Active by Sessions"
          items={rankings.topBySessions}
          icon={Target}
          color="blue"
          valueFormatter={formatNumber}
          valueKey="totalSessions"
          subtitleKey="totalCustomers"
        />

        <RankingCard
          title="Lowest Revenue Performers"
          items={rankings.bottomByRevenue}
          icon={TrendingDown}
          color="red"
          valueFormatter={formatCurrency}
          valueKey="totalPaid"
          subtitleKey="totalSessions"
          isBottom={true}
        />
      </div>

      {/* Format-Specific Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RankingCard
          title="PowerCycle Champions"
          items={rankings.topByPowerCycle}
          icon={Zap}
          color="blue"
          valueFormatter={formatCurrency}
          valueKey="cycleRevenue"
          subtitleKey="cycleSessions"
        />

        <RankingCard
          title="Barre Specialists"
          items={rankings.topByBarre}
          icon={Bike}
          color="pink"
          valueFormatter={formatCurrency}
          valueKey="barreRevenue"
          subtitleKey="barreSessions"
        />

        <RankingCard
          title="Strength Lab Leaders"
          items={rankings.topByStrength}
          icon={Dumbbell}
          color="green"
          valueFormatter={formatCurrency}
          valueKey="strengthRevenue"
          subtitleKey="strengthSessions"
        />
      </div>

      {/* Performance Metrics Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RankingCard
          title="Conversion Champions"
          items={rankings.topByConversion}
          icon={Target}
          color="indigo"
          valueFormatter={formatPercentage}
          valueKey="conversionRate"
          subtitleKey="convertedMembers"
        />

        <RankingCard
          title="Retention Masters"
          items={rankings.topByRetention}
          icon={Users}
          color="teal"
          valueFormatter={formatPercentage}
          valueKey="retentionRate"
          subtitleKey="retainedMembers"
        />

        <RankingCard
          title="Utilization Leaders"
          items={rankings.topByUtilization}
          icon={Star}
          color="purple"
          valueFormatter={formatPercentage}
          valueKey="utilizationRate"
          subtitleKey="totalSessions"
        />
      </div>

      {/* Summary Stats */}
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
        <CardHeader>
          <CardTitle className="text-gray-700">Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{rankings.topByRevenue[0]?.totalPaid ? formatCurrency(rankings.topByRevenue[0].totalPaid) : 'N/A'}</p>
              <p className="text-sm text-gray-600">Highest Revenue</p>
              <p className="text-xs text-gray-500">{rankings.topByRevenue[0]?.trainerName}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <p className="text-2xl font-bold text-green-600">{rankings.topBySessions[0]?.totalSessions ? formatNumber(rankings.topBySessions[0].totalSessions) : 'N/A'}</p>
              <p className="text-sm text-gray-600">Most Sessions</p>
              <p className="text-xs text-gray-500">{rankings.topBySessions[0]?.trainerName}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{rankings.topByConversion[0]?.conversionRate ? formatPercentage(rankings.topByConversion[0].conversionRate) : 'N/A'}</p>
              <p className="text-sm text-gray-600">Best Conversion</p>
              <p className="text-xs text-gray-500">{rankings.topByConversion[0]?.trainerName}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <p className="text-2xl font-bold text-teal-600">{rankings.topByRetention[0]?.retentionRate ? formatPercentage(rankings.topByRetention[0].retentionRate) : 'N/A'}</p>
              <p className="text-sm text-gray-600">Best Retention</p>
              <p className="text-xs text-gray-500">{rankings.topByRetention[0]?.trainerName}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};