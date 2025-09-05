import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Target, Calendar, Zap, Activity, Dumbbell, Crown, Trophy, Award, DollarSign, BarChart3 } from 'lucide-react';
import { formatNumber, formatCurrency } from '@/utils/formatters';
import { PayrollData } from '@/types/dashboard';

interface PowerCycleBarreStrengthComparisonProps {
  data: PayrollData[];
  onItemClick?: (item: any) => void;
}

export const PowerCycleBarreStrengthComparison: React.FC<PowerCycleBarreStrengthComparisonProps> = ({
  data,
  onItemClick
}) => {
  console.log('PowerCycleBarreStrengthComparison received data:', data.length, 'items');
  
  const comparisonData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        powerCycle: { sessions: 0, customers: 0, revenue: 0, avgCustomersPerSession: 0, emptySessions: 0, nonEmptySessions: 0 },
        barre: { sessions: 0, customers: 0, revenue: 0, avgCustomersPerSession: 0, emptySessions: 0, nonEmptySessions: 0 },
        strength: { sessions: 0, customers: 0, revenue: 0, avgCustomersPerSession: 0, emptySessions: 0, nonEmptySessions: 0 }
      };
    }

    const powerCycle = {
      sessions: data.reduce((sum, item) => sum + (item.cycleSessions || 0), 0),
      customers: data.reduce((sum, item) => sum + (item.cycleCustomers || 0), 0),
      revenue: data.reduce((sum, item) => sum + (item.cyclePaid || 0), 0),
      emptySessions: data.reduce((sum, item) => sum + (item.emptyCycleSessions || 0), 0),
      nonEmptySessions: data.reduce((sum, item) => sum + (item.nonEmptyCycleSessions || 0), 0),
      avgCustomersPerSession: 0
    };

    const barre = {
      sessions: data.reduce((sum, item) => sum + (item.barreSessions || 0), 0),
      customers: data.reduce((sum, item) => sum + (item.barreCustomers || 0), 0),
      revenue: data.reduce((sum, item) => sum + (item.barrePaid || 0), 0),
      emptySessions: data.reduce((sum, item) => sum + (item.emptyBarreSessions || 0), 0),
      nonEmptySessions: data.reduce((sum, item) => sum + (item.nonEmptyBarreSessions || 0), 0),
      avgCustomersPerSession: 0
    };

    const strength = {
      sessions: data.reduce((sum, item) => sum + (item.strengthSessions || 0), 0),
      customers: data.reduce((sum, item) => sum + (item.strengthCustomers || 0), 0),
      revenue: data.reduce((sum, item) => sum + (item.strengthPaid || 0), 0),
      emptySessions: data.reduce((sum, item) => sum + (item.emptyStrengthSessions || 0), 0),
      nonEmptySessions: data.reduce((sum, item) => sum + (item.nonEmptyStrengthSessions || 0), 0),
      avgCustomersPerSession: 0
    };

    // Calculate averages
    powerCycle.avgCustomersPerSession = powerCycle.sessions > 0 ? powerCycle.customers / powerCycle.sessions : 0;
    barre.avgCustomersPerSession = barre.sessions > 0 ? barre.customers / barre.sessions : 0;
    strength.avgCustomersPerSession = strength.sessions > 0 ? strength.customers / strength.sessions : 0;

    return { powerCycle, barre, strength };
  }, [data]);

  const getWinner = (pcValue: number, barreValue: number, strengthValue: number, lowerIsBetter = false) => {
    if (pcValue >= barreValue && pcValue >= strengthValue) return 'powercycle';
    if (barreValue >= strengthValue) return 'barre';
    return 'strength';
  };

  const comparisonMetrics = [
    {
      metric: 'Total Sessions',
      powerCycle: comparisonData.powerCycle.sessions,
      barre: comparisonData.barre.sessions,
      strength: comparisonData.strength.sessions,
      icon: Calendar,
      format: 'number'
    },
    {
      metric: 'Total Customers',
      powerCycle: comparisonData.powerCycle.customers,
      barre: comparisonData.barre.customers,
      strength: comparisonData.strength.customers,
      icon: Users,
      format: 'number'
    },
    {
      metric: 'Total Revenue',
      powerCycle: comparisonData.powerCycle.revenue,
      barre: comparisonData.barre.revenue,
      strength: comparisonData.strength.revenue,
      icon: Target,
      format: 'currency'
    },
    {
      metric: 'Avg Customers/Session',
      powerCycle: comparisonData.powerCycle.avgCustomersPerSession,
      barre: comparisonData.barre.avgCustomersPerSession,
      strength: comparisonData.strength.avgCustomersPerSession,
      icon: Activity,
      format: 'decimal'
    },
    {
      metric: 'Empty Sessions',
      powerCycle: comparisonData.powerCycle.emptySessions,
      barre: comparisonData.barre.emptySessions,
      strength: comparisonData.strength.emptySessions,
      icon: TrendingDown,
      format: 'number',
      lowerIsBetter: true
    },
    {
      metric: 'Revenue per Customer',
      powerCycle: comparisonData.powerCycle.customers > 0 ? comparisonData.powerCycle.revenue / comparisonData.powerCycle.customers : 0,
      barre: comparisonData.barre.customers > 0 ? comparisonData.barre.revenue / comparisonData.barre.customers : 0,
      strength: comparisonData.strength.customers > 0 ? comparisonData.strength.revenue / comparisonData.strength.customers : 0,
      icon: DollarSign,
      format: 'currency'
    }
  ];

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'decimal':
        return value.toFixed(1);
      case 'number':
      default:
        return formatNumber(value);
    }
  };

  const getWinnerBadge = (winner: string) => {
    switch (winner) {
      case 'powercycle':
        return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold shadow-md"><Crown className="w-3 h-3 mr-1" />PowerCycle</Badge>;
      case 'barre':
        return <Badge className="bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold shadow-md"><Trophy className="w-3 h-3 mr-1" />Barre</Badge>;
      case 'strength':
        return <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-md"><Award className="w-3 h-3 mr-1" />Strength</Badge>;
      default:
        return <Badge variant="outline">Tie</Badge>;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <CardTitle className="text-xl font-bold flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          PowerCycle vs Barre vs Strength Comparison
          <Badge className="bg-white/20 text-white border-white/30">
            {data.length} trainers
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comparisonMetrics.map((item, index) => {
            const winner = getWinner(
              item.powerCycle, 
              item.barre, 
              item.strength,
              item.lowerIsBetter
            );
            
            return (
              <div 
                key={index} 
                className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => onItemClick?.({ type: 'comparison', metric: item.metric, data: item })}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">{item.metric}</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-600">PowerCycle</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-gray-800">
                        {formatValue(item.powerCycle, item.format)}
                      </span>
                      {winner === 'powercycle' && getWinnerBadge(winner)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-600">Barre</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-gray-800">
                        {formatValue(item.barre, item.format)}
                      </span>
                      {winner === 'barre' && getWinnerBadge(winner)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-600">Strength</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-gray-800">
                        {formatValue(item.strength, item.format)}
                      </span>
                      {winner === 'strength' && getWinnerBadge(winner)}
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500 text-center">
                      Best: {winner === 'powercycle' ? 'PowerCycle' : winner === 'barre' ? 'Barre' : 'Strength'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};