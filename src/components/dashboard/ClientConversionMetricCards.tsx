import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, TrendingUp, DollarSign, Clock, UserCheck, Award, UserPlus, ArrowRight, Percent } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';

interface ClientConversionMetricCardsProps {
  data: NewClientData[];
}

export const ClientConversionMetricCards: React.FC<ClientConversionMetricCardsProps> = ({ data }) => {
  // Calculate comprehensive metrics
  const totalClients = data.length;
  
  // Count new members - only when isNew contains "New"
  const newMembers = data.filter(client => {
    const isNewValue = String(client.isNew || '');
    return isNewValue.includes('New');
  }).length;
  
  const convertedMembers = data.filter(client => client.conversionStatus === 'Converted').length;
  const retainedMembers = data.filter(client => client.retentionStatus === 'Retained').length;
  const trialsCompleted = newMembers; // trials completed = new member count
  
  // Lead to trial conversion (assuming first visit = lead, trials completed)
  const leadToTrialConversion = totalClients > 0 ? (trialsCompleted / totalClients) * 100 : 0;
  
  // Trial to member conversion
  const trialToMemberConversion = trialsCompleted > 0 ? (convertedMembers / trialsCompleted) * 100 : 0;
  
  // Overall conversion rate: Converted/New * 100
  const overallConversionRate = newMembers > 0 ? (convertedMembers / newMembers) * 100 : 0;
  
  // Retention rate
  const retentionRate = convertedMembers > 0 ? (retainedMembers / convertedMembers) * 100 : 0;
  
  const totalLTV = data.reduce((sum, client) => sum + (client.ltv || 0), 0);
  const avgLTV = totalClients > 0 ? totalLTV / totalClients : 0;
  
  // Calculate average conversion time
  const avgConversionTime = data.length > 0 
    ? data.reduce((sum, client) => sum + (client.conversionSpan || 0), 0) / data.length 
    : 0;

  const metrics = [
    {
      title: 'New Members',
      value: formatNumber(newMembers),
      icon: UserPlus,
      gradient: 'from-blue-500 to-indigo-600',
      description: 'Recently acquired clients',
      change: '+12.5%',
      isPositive: true
    },
    {
      title: 'Converted Members',
      value: formatNumber(convertedMembers),
      icon: Award,
      gradient: 'from-green-500 to-teal-600',
      description: 'Trial to paid conversions',
      change: '+8.3%',
      isPositive: true
    },
    {
      title: 'Retained Members',
      value: formatNumber(retainedMembers),
      icon: UserCheck,
      gradient: 'from-purple-500 to-violet-600',
      description: 'Active retained clients',
      change: '+15.2%',
      isPositive: true
    },
    {
      title: 'Conversion Rate',
      value: `${overallConversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      gradient: 'from-orange-500 to-red-600',
      description: 'New to converted rate',
      change: '+4.8%',
      isPositive: true
    },
    {
      title: 'Retention Rate',
      value: `${retentionRate.toFixed(1)}%`,
      icon: Target,
      gradient: 'from-cyan-500 to-blue-600',
      description: 'Member retention rate',
      change: '+3.1%',
      isPositive: true
    },
    {
      title: 'Avg LTV',
      value: formatCurrency(avgLTV),
      icon: DollarSign,
      gradient: 'from-pink-500 to-rose-600',
      description: 'Average lifetime value',
      change: '+7.2%',
      isPositive: true
    },
    {
      title: 'Avg Conv. Time',
      value: `${avgConversionTime.toFixed(0)} days`,
      icon: Clock,
      gradient: 'from-emerald-500 to-green-600',
      description: 'Average conversion time',
      change: '-2.1 days',
      isPositive: true
    },
    {
      title: 'Trial → Member',
      value: `${trialToMemberConversion.toFixed(1)}%`,
      icon: ArrowRight,
      gradient: 'from-indigo-500 to-purple-600',
      description: 'Trial conversion rate',
      change: '+5.4%',
      isPositive: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card 
          key={metric.title} 
          className="bg-white shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer hover:-translate-y-1"
        >
          <CardContent className="p-0">
            <div className={`bg-gradient-to-r ${metric.gradient} p-6 text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-8 -translate-y-8 opacity-20">
                <metric.icon className="w-20 h-20" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <metric.icon className="w-6 h-6" />
                  <h3 className="font-semibold text-sm">{metric.title}</h3>
                </div>
                <p className="text-3xl font-bold mb-2">{metric.value}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs opacity-90">{metric.description}</p>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs px-2 py-1 ${
                      metric.isPositive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-red-500/20 text-red-100'
                    }`}
                  >
                    {metric.change}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};