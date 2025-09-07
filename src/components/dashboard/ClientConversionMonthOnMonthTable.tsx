
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { motion } from 'framer-motion';

interface ClientConversionMonthOnMonthTableProps {
  data: NewClientData[];
  onRowClick?: (monthData: any) => void;
}

export const ClientConversionMonthOnMonthTable: React.FC<ClientConversionMonthOnMonthTableProps> = ({ data, onRowClick }) => {
  console.log('MonthOnMonth data:', data.length, 'records');

  const monthlyData = React.useMemo(() => {
    const monthlyStats = data.reduce((acc, client) => {
      const dateStr = client.firstVisitDate;
      let date: Date;
      
      // Handle different date formats consistently
      if (dateStr.includes('/')) {
        const parts = dateStr.split(' ')[0].split('/');
        if (parts.length === 3) {
          // Try DD/MM/YYYY format first
          const [day, month, year] = parts;
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          
          // If invalid, try MM/DD/YYYY format
          if (isNaN(date.getTime())) {
            date = new Date(parseInt(year), parseInt(day) - 1, parseInt(month));
          }
        } else {
          date = new Date(dateStr);
        }
      } else {
        date = new Date(dateStr);
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateStr);
        return acc;
      }
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthName,
          sortKey: monthKey,
          totalMembers: 0,
          newMembers: 0,
          converted: 0,
          retained: 0,
          totalLTV: 0,
          conversionIntervals: [],
          visitsPostTrial: [],
          clients: []
        };
      }
      
      acc[monthKey].totalMembers++;
      acc[monthKey].clients.push(client);
      
      // Count new members - when isNew contains "new" (case insensitive)
      if ((client.isNew || '').toLowerCase().includes('new')) {
        acc[monthKey].newMembers++;
      }
      
      // Count converted - when conversionStatus contains "converted" (case insensitive)
      if ((client.conversionStatus || '').toLowerCase().includes('converted')) {
        acc[monthKey].converted++;
      }
      
      // Count retained - when retentionStatus contains "retained" (case insensitive)
      if ((client.retentionStatus || '').toLowerCase().includes('retained')) {
        acc[monthKey].retained++;
      }
      
      // Sum LTV
      acc[monthKey].totalLTV += client.ltv || 0;
      
      // Calculate conversion interval (first purchase date - first visit date)
      if (client.firstPurchase && client.firstVisitDate) {
        const firstVisitDate = new Date(client.firstVisitDate);
        const firstPurchaseDate = new Date(client.firstPurchase);
        
        if (!isNaN(firstVisitDate.getTime()) && !isNaN(firstPurchaseDate.getTime())) {
          const intervalDays = Math.ceil((firstPurchaseDate.getTime() - firstVisitDate.getTime()) / (1000 * 60 * 60 * 24));
          if (intervalDays >= 0) {
            acc[monthKey].conversionIntervals.push(intervalDays);
          }
        }
      }
      
      if (client.visitsPostTrial && client.visitsPostTrial > 0) {
        acc[monthKey].visitsPostTrial.push(client.visitsPostTrial);
      }
      
      return acc;
    }, {} as Record<string, any>);

    const processed = Object.values(monthlyStats)
      .map((stat: any) => ({
        ...stat,
        trialsCompleted: stat.newMembers, // trials completed = new member count
        conversionRate: stat.newMembers > 0 ? (stat.converted / stat.newMembers) * 100 : 0,
        retentionRate: stat.totalMembers > 0 ? (stat.retained / stat.totalMembers) * 100 : 0,
        avgLTV: stat.totalMembers > 0 ? stat.totalLTV / stat.totalMembers : 0,
        avgConversionInterval: stat.conversionIntervals.length > 0 
          ? stat.conversionIntervals.reduce((a: number, b: number) => a + b, 0) / stat.conversionIntervals.length 
          : 0,
        avgVisitsPostTrial: stat.visitsPostTrial.length > 0
          ? stat.visitsPostTrial.reduce((a: number, b: number) => a + b, 0) / stat.visitsPostTrial.length
          : 0
      }))
      .sort((a, b) => b.sortKey.localeCompare(a.sortKey));

    console.log('Monthly data processed:', processed);
    return processed;
  }, [data]);

  const columns = [
    {
      key: 'month',
      header: 'Month',
      className: 'font-semibold min-w-[100px]',
      render: (value: string) => (
        <div className="font-bold text-slate-800 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 rounded-lg">
          {value}
        </div>
      )
    },
    {
      key: 'totalMembers',
      header: 'Total Members',
      align: 'center' as const,
      render: (value: number) => (
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{formatNumber(value)}</div>
          <div className="text-xs text-slate-500">members</div>
        </div>
      )
    },
    {
      key: 'newMembers',
      header: 'New Members',
      align: 'center' as const,
      render: (value: number) => (
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{formatNumber(value)}</div>
          <div className="text-xs text-slate-500">new</div>
        </div>
      )
    },
    {
      key: 'converted',
      header: 'Converted',
      align: 'center' as const,
      render: (value: number) => (
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{formatNumber(value)}</div>
          <div className="text-xs text-slate-500">converted</div>
        </div>
      )
    },
    {
      key: 'conversionRate',
      header: 'Conv. Rate',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex items-center justify-center gap-1">
          {value > 25 ? <TrendingUp className="w-3 h-3 text-green-500" /> : value < 10 ? <TrendingDown className="w-3 h-3 text-red-500" /> : null}
          <Badge className={`font-bold ${value > 25 ? 'bg-green-100 text-green-800' : value < 10 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
            {value.toFixed(1)}%
          </Badge>
        </div>
      )
    },
    {
      key: 'retained',
      header: 'Retained',
      align: 'center' as const,
      render: (value: number) => (
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">{formatNumber(value)}</div>
          <div className="text-xs text-slate-500">retained</div>
        </div>
      )
    },
    {
      key: 'retentionRate',
      header: 'Ret. Rate',
      align: 'center' as const,
      render: (value: number) => (
        <Badge className={`font-bold ${value > 70 ? 'bg-purple-100 text-purple-800' : value < 40 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
          {value.toFixed(1)}%
        </Badge>
      )
    },
    {
      key: 'totalLTV',
      header: 'Total LTV',
      align: 'right' as const,
      render: (value: number) => (
        <div className="text-right">
          <div className="text-lg font-bold text-emerald-600">{formatCurrency(value)}</div>
          <div className="text-xs text-slate-500">total value</div>
        </div>
      )
    },
    {
      key: 'avgLTV',
      header: 'Avg LTV',
      align: 'right' as const,
      render: (value: number) => (
        <div className="text-right">
          <div className="text-lg font-bold text-emerald-600">{formatCurrency(value)}</div>
          <div className="text-xs text-slate-500">per client</div>
        </div>
      )
    },
    {
      key: 'avgConversionInterval',
      header: 'Avg Conv. Interval',
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 font-bold">
          {Math.round(value)} days
        </Badge>
      )
    },
    {
      key: 'avgVisitsPostTrial',
      header: 'Avg Visits',
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold">
          {value.toFixed(1)}
        </Badge>
      )
    }
  ];

  // Calculate totals
  const totals = {
    month: 'TOTAL',
    totalMembers: monthlyData.reduce((sum, row) => sum + row.totalMembers, 0),
    newMembers: monthlyData.reduce((sum, row) => sum + row.newMembers, 0),
    converted: monthlyData.reduce((sum, row) => sum + row.converted, 0),
    conversionRate: 0,
    retained: monthlyData.reduce((sum, row) => sum + row.retained, 0),
    retentionRate: 0,
    totalLTV: monthlyData.reduce((sum, row) => sum + row.totalLTV, 0),
    avgLTV: monthlyData.reduce((sum, row) => sum + row.totalLTV, 0) / Math.max(monthlyData.reduce((sum, row) => sum + row.totalMembers, 0), 1),
    avgConversionInterval: monthlyData.reduce((sum, row) => sum + (row.avgConversionInterval * row.totalMembers), 0) / Math.max(monthlyData.reduce((sum, row) => sum + row.totalMembers, 0), 1),
    avgVisitsPostTrial: monthlyData.reduce((sum, row) => sum + (row.avgVisitsPostTrial * row.totalMembers), 0) / Math.max(monthlyData.reduce((sum, row) => sum + row.totalMembers, 0), 1)
  };
  totals.conversionRate = totals.newMembers > 0 ? (totals.converted / totals.newMembers) * 100 : 0;
  totals.retentionRate = totals.totalMembers > 0 ? (totals.retained / totals.totalMembers) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-white shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Month-on-Month Client Conversion Analysis
          <Badge variant="secondary" className="bg-white/20 text-white">
            {monthlyData.length} Months
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ModernDataTable
          data={monthlyData}
          columns={columns}
          headerGradient="from-blue-600 to-cyan-600"
          showFooter={true}
          footerData={totals}
          maxHeight="600px"
          onRowClick={onRowClick}
        />
      </CardContent>
    </Card>
    </motion.div>
  );
};
