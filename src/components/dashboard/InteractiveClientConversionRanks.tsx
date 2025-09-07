import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingDown, MapPin, Users, DollarSign, Target, Crown, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';

interface InteractiveClientConversionRanksProps {
  data: NewClientData[];
}

type RankingType = 'trainers_conversion' | 'trainers_ltv' | 'locations_conversion';
type ViewType = 'top' | 'bottom';

export const InteractiveClientConversionRanks: React.FC<InteractiveClientConversionRanksProps> = ({ data }) => {
  const [activeRankingType, setActiveRankingType] = useState<RankingType>('trainers_conversion');
  const [activeViewType, setActiveViewType] = useState<ViewType>('top');

  // Calculate trainer performance
  const trainerStats = React.useMemo(() => {
    const stats = new Map();
    
    data.forEach(client => {
      const trainer = client.trainerName || 'Unknown';
      if (!stats.has(trainer)) {
        stats.set(trainer, {
          name: trainer,
          totalClients: 0,
          newMembers: 0,
          converted: 0,
          retained: 0,
          totalLTV: 0
        });
      }
      
      const trainerStat = stats.get(trainer);
      trainerStat.totalClients++;
      trainerStat.totalLTV += client.ltv || 0;
      
      if (String(client.isNew || '').includes('New')) {
        trainerStat.newMembers++;
      }
      if (client.conversionStatus === 'Converted') {
        trainerStat.converted++;
      }
      if (client.retentionStatus === 'Retained') {
        trainerStat.retained++;
      }
    });
    
    return Array.from(stats.values()).map(stat => ({
      ...stat,
      conversionRate: stat.newMembers > 0 ? (stat.converted / stat.newMembers) * 100 : 0,
      avgLTV: stat.totalClients > 0 ? stat.totalLTV / stat.totalClients : 0
    }));
  }, [data]);

  // Calculate location performance
  const locationStats = React.useMemo(() => {
    const stats = new Map();
    
    data.forEach(client => {
      const location = client.firstVisitLocation || client.homeLocation || 'Unknown';
      if (!stats.has(location)) {
        stats.set(location, {
          name: location,
          totalClients: 0,
          newMembers: 0,
          converted: 0,
          retained: 0,
          totalLTV: 0
        });
      }
      
      const locationStat = stats.get(location);
      locationStat.totalClients++;
      locationStat.totalLTV += client.ltv || 0;
      
      if (String(client.isNew || '').includes('New')) {
        locationStat.newMembers++;
      }
      if (client.conversionStatus === 'Converted') {
        locationStat.converted++;
      }
      if (client.retentionStatus === 'Retained') {
        locationStat.retained++;
      }
    });
    
    return Array.from(stats.values()).map(stat => ({
      ...stat,
      conversionRate: stat.newMembers > 0 ? (stat.converted / stat.newMembers) * 100 : 0,
      avgLTV: stat.totalClients > 0 ? stat.totalLTV / stat.totalClients : 0
    }));
  }, [data]);

  // Get rankings based on current selection
  const getCurrentRankings = () => {
    let sourceData: any[] = [];
    let sortKey = '';
    let filterMinimum = 0;

    switch (activeRankingType) {
      case 'trainers_conversion':
        sourceData = trainerStats;
        sortKey = 'conversionRate';
        filterMinimum = 3; // Minimum threshold for trainers
        break;
      case 'trainers_ltv':
        sourceData = trainerStats;
        sortKey = 'avgLTV';
        filterMinimum = 1;
        break;
      case 'locations_conversion':
        sourceData = locationStats;
        sortKey = 'conversionRate';
        filterMinimum = 1;
        break;
    }

    const filtered = sourceData.filter(item => 
      activeRankingType.includes('conversion') ? item.newMembers >= filterMinimum : item.totalClients >= filterMinimum
    );

    const sorted = filtered.sort((a, b) => 
      activeViewType === 'top' 
        ? b[sortKey] - a[sortKey]
        : a[sortKey] - b[sortKey]
    );

    return sorted.slice(0, 5);
  };

  const rankings = getCurrentRankings();

  const getRankingTitle = () => {
    const typeMap = {
      trainers_conversion: 'Trainers by Conversion Rate',
      trainers_ltv: 'Trainers by Average LTV',
      locations_conversion: 'Locations by Conversion Rate'
    };
    return typeMap[activeRankingType];
  };

  const getRankingIcon = () => {
    const iconMap = {
      trainers_conversion: activeViewType === 'top' ? Crown : AlertTriangle,
      trainers_ltv: activeViewType === 'top' ? DollarSign : AlertTriangle,
      locations_conversion: activeViewType === 'top' ? MapPin : TrendingDown
    };
    return iconMap[activeRankingType];
  };

  const getRankingGradient = () => {
    if (activeViewType === 'bottom') return 'from-red-500 to-pink-600';
    
    const gradientMap = {
      trainers_conversion: 'from-yellow-500 to-orange-600',
      trainers_ltv: 'from-purple-500 to-indigo-600',
      locations_conversion: 'from-green-500 to-emerald-600'
    };
    return gradientMap[activeRankingType];
  };

  const RankIcon = getRankingIcon();

  return (
    <div className="space-y-6">
      {/* Control Buttons */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Ranking Type Selection */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Select Ranking Category:</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeRankingType === 'trainers_conversion' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveRankingType('trainers_conversion')}
                  className="gap-2"
                >
                  <Target className="w-4 h-4" />
                  Trainer Conversion
                </Button>
                <Button
                  variant={activeRankingType === 'trainers_ltv' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveRankingType('trainers_ltv')}
                  className="gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Trainer LTV
                </Button>
                <Button
                  variant={activeRankingType === 'locations_conversion' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveRankingType('locations_conversion')}
                  className="gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Location Performance
                </Button>
              </div>
            </div>

            {/* View Type Selection */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">View:</h4>
              <div className="flex gap-2">
                <Button
                  variant={activeViewType === 'top' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveViewType('top')}
                  className="gap-2"
                >
                  <ChevronUp className="w-4 h-4" />
                  Top Performers
                </Button>
                <Button
                  variant={activeViewType === 'bottom' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveViewType('bottom')}
                  className="gap-2"
                >
                  <ChevronDown className="w-4 h-4" />
                  Bottom Performers
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rankings Display */}
      <Card className="bg-white shadow-lg border-0 overflow-hidden hover:shadow-xl transition-all duration-300">
        <CardHeader className={`bg-gradient-to-r ${getRankingGradient()} text-white`}>
          <CardTitle className="flex items-center gap-3">
            <RankIcon className="w-6 h-6" />
            <div>
              <h3 className="text-lg font-bold">{getRankingTitle()}</h3>
              <p className="text-sm opacity-90">
                {activeViewType === 'top' ? 'Best performers' : 'Needs attention'} • Top {rankings.length}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {rankings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No data available for the selected criteria</p>
            </div>
          ) : (
            rankings.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                    index === 0 && activeViewType === 'top' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900' :
                    index === 1 && activeViewType === 'top' ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' :
                    index === 2 && activeViewType === 'top' ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-orange-900' :
                    activeViewType === 'bottom' ? 'bg-red-100 text-red-800' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {activeViewType === 'top' && index === 0 ? '👑' : index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 truncate max-w-[150px]" title={item.name}>
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatNumber(item.totalClients)} clients • {formatNumber(item.newMembers)} new
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    className={`${
                      activeViewType === 'top' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {activeRankingType.includes('ltv') 
                      ? formatCurrency(item.avgLTV)
                      : `${item.conversionRate.toFixed(1)}%`
                    }
                  </Badge>
                  {activeRankingType.includes('ltv') && (
                    <p className="text-xs text-gray-500 mt-1">
                      {item.conversionRate.toFixed(1)}% conversion
                    </p>
                  )}
                  {!activeRankingType.includes('ltv') && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCurrency(item.avgLTV)} avg LTV
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-blue-900">
            <Trophy className="w-6 h-6" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800">Total Trainers</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {trainerStats.length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800">Total Locations</span>
                <Badge className="bg-indigo-100 text-indigo-800">
                  {locationStats.length}
                </Badge>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800">Best Conversion</span>
                <Badge className="bg-green-100 text-green-800">
                  {trainerStats.length > 0 
                    ? Math.max(...trainerStats.map(t => t.conversionRate)).toFixed(1) + '%'
                    : '0%'
                  }
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800">Highest LTV</span>
                <Badge className="bg-purple-100 text-purple-800">
                  {trainerStats.length > 0 
                    ? formatCurrency(Math.max(...trainerStats.map(t => t.avgLTV)))
                    : '₹0'
                  }
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};