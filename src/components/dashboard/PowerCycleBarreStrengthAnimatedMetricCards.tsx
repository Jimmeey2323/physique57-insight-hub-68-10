import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Users, Zap, Bike, Dumbbell, Target } from 'lucide-react';
import { ProcessedTrainerData } from './TrainerDataProcessor';
import { formatNumber, formatCurrency, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface PowerCycleBarreStrengthAnimatedMetricCardsProps {
  data: ProcessedTrainerData[];
  onMetricClick: (metricData: any) => void;
}

export const PowerCycleBarreStrengthAnimatedMetricCards: React.FC<PowerCycleBarreStrengthAnimatedMetricCardsProps> = ({ 
  data, 
  onMetricClick 
}) => {
  // Calculate metrics for each format
  const cycleSessions = data.reduce((sum, trainer) => sum + trainer.cycleSessions, 0);
  const cycleRevenue = data.reduce((sum, trainer) => sum + trainer.cycleRevenue, 0);
  const cycleCustomers = data.reduce((sum, trainer) => sum + trainer.cycleCustomers, 0);
  
  const barreSessions = data.reduce((sum, trainer) => sum + trainer.barreSessions, 0);
  const barreRevenue = data.reduce((sum, trainer) => sum + trainer.barreRevenue, 0);
  const barreCustomers = data.reduce((sum, trainer) => sum + trainer.barreCustomers, 0);
  
  const strengthSessions = data.reduce((sum, trainer) => sum + trainer.strengthSessions, 0);
  const strengthRevenue = data.reduce((sum, trainer) => sum + trainer.strengthRevenue, 0);
  const strengthCustomers = data.reduce((sum, trainer) => sum + trainer.strengthCustomers, 0);

  // Calculate overall metrics
  const totalSessions = cycleSessions + barreSessions + strengthSessions;
  const totalRevenue = cycleRevenue + barreRevenue + strengthRevenue;
  const totalCustomers = cycleCustomers + barreCustomers + strengthCustomers;
  const avgRevenuePerSession = totalSessions > 0 ? totalRevenue / totalSessions : 0;

  // Calculate performance indicators
  const avgConversionRate = data.length > 0 ? 
    data.reduce((sum, trainer) => sum + trainer.conversionRate, 0) / data.length : 0;
  const avgRetentionRate = data.length > 0 ? 
    data.reduce((sum, trainer) => sum + trainer.retentionRate, 0) / data.length : 0;
  const avgUtilizationRate = data.length > 0 ? 
    data.reduce((sum, trainer) => sum + trainer.utilizationRate, 0) / data.length : 0;

  const metricCards = [
    {
      title: 'PowerCycle Performance',
      value: formatCurrency(cycleRevenue),
      subtitle: `${formatNumber(cycleSessions)} sessions • ${formatNumber(cycleCustomers)} customers`,
      icon: Zap,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      trend: cycleSessions > 0 ? 'up' : 'neutral',
      trendValue: totalSessions > 0 ? `${Math.round((cycleSessions / totalSessions) * 100)}%` : '0%',
      data: { format: 'cycle', sessions: cycleSessions, revenue: cycleRevenue, customers: cycleCustomers }
    },
    {
      title: 'Barre Performance',
      value: formatCurrency(barreRevenue),
      subtitle: `${formatNumber(barreSessions)} sessions • ${formatNumber(barreCustomers)} customers`,
      icon: Bike,
      gradient: 'from-pink-500 to-pink-600',
      bgGradient: 'from-pink-50 to-pink-100',
      trend: barreSessions > 0 ? 'up' : 'neutral',
      trendValue: totalSessions > 0 ? `${Math.round((barreSessions / totalSessions) * 100)}%` : '0%',
      data: { format: 'barre', sessions: barreSessions, revenue: barreRevenue, customers: barreCustomers }
    },
    {
      title: 'Strength Lab Performance',
      value: formatCurrency(strengthRevenue),
      subtitle: `${formatNumber(strengthSessions)} sessions • ${formatNumber(strengthCustomers)} customers`,
      icon: Dumbbell,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      trend: strengthSessions > 0 ? 'up' : 'neutral',
      trendValue: totalSessions > 0 ? `${Math.round((strengthSessions / totalSessions) * 100)}%` : '0%',
      data: { format: 'strength', sessions: strengthSessions, revenue: strengthRevenue, customers: strengthCustomers }
    },
    {
      title: 'Total Performance',
      value: formatCurrency(totalRevenue),
      subtitle: `${formatNumber(totalSessions)} sessions • Avg ${formatCurrency(avgRevenuePerSession)}/session`,
      icon: Target,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      trend: 'up',
      trendValue: formatCurrency(avgRevenuePerSession),
      data: { format: 'total', sessions: totalSessions, revenue: totalRevenue, customers: totalCustomers }
    },
    {
      title: 'Conversion Rate',
      value: formatPercentage(avgConversionRate),
      subtitle: `Average across all trainers`,
      icon: Users,
      gradient: 'from-indigo-500 to-indigo-600',
      bgGradient: 'from-indigo-50 to-indigo-100',
      trend: avgConversionRate > 30 ? 'up' : avgConversionRate > 20 ? 'neutral' : 'down',
      trendValue: `${formatNumber(data.reduce((sum, t) => sum + t.convertedMembers, 0))} converted`,
      data: { metric: 'conversion', value: avgConversionRate, converted: data.reduce((sum, t) => sum + t.convertedMembers, 0) }
    },
    {
      title: 'Retention Rate',
      value: formatPercentage(avgRetentionRate),
      subtitle: `Member retention performance`,
      icon: Activity,
      gradient: 'from-teal-500 to-teal-600',
      bgGradient: 'from-teal-50 to-teal-100',
      trend: avgRetentionRate > 70 ? 'up' : avgRetentionRate > 50 ? 'neutral' : 'down',
      trendValue: `${formatNumber(data.reduce((sum, t) => sum + t.retainedMembers, 0))} retained`,
      data: { metric: 'retention', value: avgRetentionRate, retained: data.reduce((sum, t) => sum + t.retainedMembers, 0) }
    }
  ];

  const handleCardClick = (card: any) => {
    const enhancedData = {
      ...card.data,
      title: card.title,
      rawData: data,
      filteredData: data
    };
    onMetricClick(enhancedData);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metricCards.map((card, index) => {
        const Icon = card.icon;
        const TrendIcon = card.trend === 'up' ? TrendingUp : card.trend === 'down' ? TrendingDown : Activity;
        
        return (
          <Card 
            key={index}
            className={cn(
              "group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl",
              "bg-gradient-to-br", card.bgGradient,
              "border-0 shadow-lg backdrop-blur-sm"
            )}
            onClick={() => handleCardClick(card)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center",
                  "bg-gradient-to-r", card.gradient,
                  "shadow-lg group-hover:scale-110 transition-transform duration-300"
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "bg-white/80 text-gray-700 border-0",
                    card.trend === 'up' && "bg-green-100 text-green-700",
                    card.trend === 'down' && "bg-red-100 text-red-700"
                  )}
                >
                  <TrendIcon className="w-3 h-3 mr-1" />
                  {card.trendValue}
                </Badge>
              </div>
              <CardTitle className="text-lg font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">
                  {card.value}
                </p>
                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                  {card.subtitle}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};