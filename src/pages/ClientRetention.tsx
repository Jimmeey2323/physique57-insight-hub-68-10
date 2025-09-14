import React, { useEffect, useState, useMemo } from 'react';
import { useNewClientData } from '@/hooks/useNewClientData';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Users } from 'lucide-react';
import { Footer } from '@/components/ui/footer';
import { ProfessionalLoader } from '@/components/dashboard/ProfessionalLoader';
import { AdvancedExportButton } from '@/components/ui/AdvancedExportButton';
import { Card, CardContent } from '@/components/ui/card';
import { NewClientFilterOptions } from '@/types/dashboard';
import { ModernHeroSection } from '@/components/ui/ModernHeroSection';
import { formatNumber } from '@/utils/formatters';
import { getPreviousMonthDateRange, parseDate } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

// Import new components for rebuilt client conversion tab
import { EnhancedClientConversionFilterSection } from '@/components/dashboard/EnhancedClientConversionFilterSection';
import { ClientConversionMetricCards } from '@/components/dashboard/ClientConversionMetricCards';
import { ClientConversionSimplifiedRanks } from '@/components/dashboard/ClientConversionSimplifiedRanks';
import { ClientConversionEnhancedCharts } from '@/components/dashboard/ClientConversionEnhancedCharts';
import { ClientConversionDataTableSelector } from '@/components/dashboard/ClientConversionDataTableSelector';
import { ClientConversionMonthOnMonthTable } from '@/components/dashboard/ClientConversionMonthOnMonthTable';
import { ClientConversionMonthOnMonthByTypeTable } from '@/components/dashboard/ClientConversionMonthOnMonthByTypeTable';
import { ClientConversionYearOnYearTable } from '@/components/dashboard/ClientConversionYearOnYearTable';
import { ClientConversionMembershipTable } from '@/components/dashboard/ClientConversionMembershipTable';
import { ClientHostedClassesTable } from '@/components/dashboard/ClientHostedClassesTable';
import { ClientConversionDrillDownModalV3 } from '@/components/dashboard/ClientConversionDrillDownModalV3';
const ClientRetention = () => {
  const {
    data,
    loading
  } = useNewClientData();
  const {
    isLoading,
    setLoading
  } = useGlobalLoading();
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [activeTable, setActiveTable] = useState('monthonmonthbytype');
  const [drillDownModal, setDrillDownModal] = useState({
    isOpen: false,
    client: null,
    title: '',
    data: null,
    type: 'month' as any
  });

  // Filters state
  const [filters, setFilters] = useState<NewClientFilterOptions>(() => {
    const previousMonth = getPreviousMonthDateRange();
    return {
      dateRange: previousMonth,
      location: [],
      homeLocation: [],
      trainer: [],
      paymentMethod: [],
      retentionStatus: [],
      conversionStatus: [],
      isNew: [],
      minLTV: undefined,
      maxLTV: undefined
    };
  });
  useEffect(() => {
    setLoading(loading, 'Analyzing client conversion and retention patterns...');
  }, [loading, setLoading]);

  // Get unique values for filters (only 3 main locations)
  const uniqueLocations = React.useMemo(() => {
    const mainLocations = ['Kwality House, Kemps Corner', 'Supreme HQ, Bandra', 'Kenkere House, Bengaluru'];
    const locations = new Set<string>();
    data.forEach(client => {
      if (client.firstVisitLocation && mainLocations.includes(client.firstVisitLocation)) {
        locations.add(client.firstVisitLocation);
      }
      if (client.homeLocation && mainLocations.includes(client.homeLocation)) {
        locations.add(client.homeLocation);
      }
    });
    return Array.from(locations).filter(Boolean);
  }, [data]);
  const uniqueTrainers = React.useMemo(() => {
    const trainers = new Set<string>();
    data.forEach(client => {
      if (client.trainerName) trainers.add(client.trainerName);
    });
    return Array.from(trainers).filter(Boolean);
  }, [data]);
  const uniqueMembershipTypes = React.useMemo(() => {
    const memberships = new Set<string>();
    data.forEach(client => {
      if (client.membershipUsed) memberships.add(client.membershipUsed);
    });
    return Array.from(memberships).filter(Boolean);
  }, [data]);

  // Filter data by selected location and filters
  const filteredData = React.useMemo(() => {
    console.log('Filtering data. Total records:', data.length, 'Selected location:', selectedLocation);
    let filtered = data;

    // Apply date range filter FIRST
    if (filters.dateRange.start || filters.dateRange.end) {
      const startDate = filters.dateRange.start ? new Date(filters.dateRange.start + 'T00:00:00') : null;
      const endDate = filters.dateRange.end ? new Date(filters.dateRange.end + 'T23:59:59') : null;
      console.log('Date filter range:', {
        start: startDate,
        end: endDate
      });
      filtered = filtered.filter(client => {
        if (!client.firstVisitDate) return false;
        const clientDate = parseDate(client.firstVisitDate);
        if (!clientDate) {
          console.warn('Invalid client date:', client.firstVisitDate);
          return false;
        }

        // Set client date to start of day for comparison
        clientDate.setHours(0, 0, 0, 0);
        const withinRange = (!startDate || clientDate >= startDate) && (!endDate || clientDate <= endDate);
        if (!withinRange) {
          console.log('Client filtered out by date:', {
            clientDate: clientDate.toISOString().split('T')[0],
            originalDate: client.firstVisitDate,
            startDate: startDate?.toISOString().split('T')[0],
            endDate: endDate?.toISOString().split('T')[0]
          });
        }
        return withinRange;
      });
      console.log(`Date filter applied: ${data.length} -> ${filtered.length} records`);
    }

    // Apply location filter - check both firstVisitLocation and homeLocation
    if (selectedLocation !== 'All Locations') {
      const beforeLocationFilter = filtered.length;

      // Debug: Check all unique locations for Kenkere House
      if (selectedLocation === 'Kenkere House, Bengaluru') {
        const uniqueFirstLocations = [...new Set(filtered.map(c => c.firstVisitLocation).filter(Boolean))];
        const uniqueHomeLocations = [...new Set(filtered.map(c => c.homeLocation).filter(Boolean))];
        console.log('All unique first visit locations:', uniqueFirstLocations.filter(loc => loc.includes('Kenkere') || loc.includes('Bengaluru')));
        console.log('All unique home locations:', uniqueHomeLocations.filter(loc => loc.includes('Kenkere') || loc.includes('Bengaluru')));
      }
      filtered = filtered.filter(client => {
        const firstLocation = client.firstVisitLocation || '';
        const homeLocation = client.homeLocation || '';

        // For Kenkere House, try more flexible matching
        if (selectedLocation === 'Kenkere House, Bengaluru') {
          const matchesFirst = firstLocation.toLowerCase().includes('kenkere') || firstLocation.toLowerCase().includes('bengaluru') || firstLocation === 'Kenkere House';
          const matchesHome = homeLocation.toLowerCase().includes('kenkere') || homeLocation.toLowerCase().includes('bengaluru') || homeLocation === 'Kenkere House';
          return matchesFirst || matchesHome;
        }

        // For other locations, use exact match
        return firstLocation === selectedLocation || homeLocation === selectedLocation;
      });
      console.log(`Location filter ${selectedLocation}: ${beforeLocationFilter} -> ${filtered.length} records`);
    }

    // Apply additional filters
    if (filters.location.length > 0) {
      filtered = filtered.filter(client => filters.location.includes(client.firstVisitLocation || '') || filters.location.includes(client.homeLocation || ''));
    }
    if (filters.trainer.length > 0) {
      filtered = filtered.filter(client => filters.trainer.includes(client.trainerName || ''));
    }

    // Apply other filters
    if (filters.conversionStatus.length > 0) {
      filtered = filtered.filter(client => filters.conversionStatus.includes(client.conversionStatus || ''));
    }
    if (filters.retentionStatus.length > 0) {
      filtered = filtered.filter(client => filters.retentionStatus.includes(client.retentionStatus || ''));
    }
    if (filters.paymentMethod.length > 0) {
      filtered = filtered.filter(client => filters.paymentMethod.includes(client.paymentMethod || ''));
    }
    if (filters.isNew.length > 0) {
      filtered = filtered.filter(client => filters.isNew.includes(client.isNew || ''));
    }

    // Apply LTV filters
    if (filters.minLTV !== undefined) {
      filtered = filtered.filter(client => (client.ltv || 0) >= filters.minLTV!);
    }
    if (filters.maxLTV !== undefined) {
      filtered = filtered.filter(client => (client.ltv || 0) <= filters.maxLTV!);
    }
    console.log('Filtered data:', filtered.length, 'records');
    return filtered;
  }, [data, selectedLocation, filters]);
  const heroMetrics = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    const locations = [{
      key: 'Kwality House, Kemps Corner',
      name: 'Kwality'
    }, {
      key: 'Supreme HQ, Bandra',
      name: 'Supreme'
    }, {
      key: 'Kenkere House, Bengaluru',
      name: 'Kenkere'
    }];
    return locations.map(location => {
      const locationData = filteredData.filter(item => {
        const firstLocation = item.firstVisitLocation || '';
        const homeLocation = item.homeLocation || '';

        // For Kenkere House, use flexible matching
        if (location.key === 'Kenkere House, Bengaluru') {
          return firstLocation.toLowerCase().includes('kenkere') || firstLocation.toLowerCase().includes('bengaluru') || firstLocation === 'Kenkere House' || homeLocation.toLowerCase().includes('kenkere') || homeLocation.toLowerCase().includes('bengaluru') || homeLocation === 'Kenkere House';
        }

        // For other locations, use exact match
        return firstLocation === location.key || homeLocation === location.key;
      });
      const totalClients = locationData.length;
      return {
        location: location.name,
        label: 'Filtered Clients',
        value: formatNumber(totalClients)
      };
    });
  }, [filteredData]);
  if (isLoading) {
    return <ProfessionalLoader variant="conversion" subtitle="Analyzing client conversion and retention patterns..." />;
  }
  console.log('Rendering ClientRetention with data:', data.length, 'records, filtered:', filteredData.length);
  const exportButton = <AdvancedExportButton newClientData={filteredData} defaultFileName={`client-conversion-${selectedLocation.replace(/\s+/g, '-').toLowerCase()}`} size="sm" variant="ghost" />;
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <ModernHeroSection 
          title="Client Conversion & Retention" 
          subtitle="Comprehensive client acquisition and retention analysis across all customer touchpoints" 
          variant="client" 
          metrics={heroMetrics} 
          exportButton={exportButton}
        />
      </div>

      <div className="container mx-auto px-6 py-8 bg-white min-h-screen">
        <main className="space-y-8">
          {/* Enhanced Filter Section */}
          <EnhancedClientConversionFilterSection filters={filters} onFiltersChange={setFilters} locations={uniqueLocations} trainers={uniqueTrainers} membershipTypes={uniqueMembershipTypes} />

          {/* Location Tabs - Fixed styling */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-white/30 grid grid-cols-4 w-full max-w-4xl">
              <button 
                onClick={() => setSelectedLocation('All Locations')} 
                className={cn(
                  "px-6 py-3 rounded-xl transition-all duration-300 font-medium text-sm flex flex-col items-center gap-2",
                  selectedLocation === 'All Locations' 
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                    : "text-slate-800 hover:text-slate-700 hover:bg-slate-100/50"
                )}
              >
                <Users className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-bold">All Locations</div>
                  <div className="text-xs opacity-80">({data.length})</div>
                </div>
              </button>
              <button 
                onClick={() => setSelectedLocation('Kwality House, Kemps Corner')} 
                className={cn(
                  "px-6 py-3 rounded-xl transition-all duration-300 font-medium text-sm flex flex-col items-center gap-2",
                  selectedLocation === 'Kwality House, Kemps Corner' 
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                    : "text-slate-800 hover:text-slate-700 hover:bg-slate-100/50"
                )}
              >
                <Users className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-bold">Kwality House</div>
                  <div className="text-xs opacity-80">Kemps Corner ({data.filter(client => client.firstVisitLocation === 'Kwality House, Kemps Corner' || client.homeLocation === 'Kwality House, Kemps Corner').length})</div>
                </div>
              </button>
              <button 
                onClick={() => setSelectedLocation('Supreme HQ, Bandra')} 
                className={cn(
                  "px-6 py-3 rounded-xl transition-all duration-300 font-medium text-sm flex flex-col items-center gap-2",
                  selectedLocation === 'Supreme HQ, Bandra' 
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                    : "text-slate-800 hover:text-slate-700 hover:bg-slate-100/50"
                )}
              >
                <Users className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-bold">Supreme HQ</div>
                  <div className="text-xs opacity-80">Bandra ({data.filter(client => client.firstVisitLocation === 'Supreme HQ, Bandra' || client.homeLocation === 'Supreme HQ, Bandra').length})</div>
                </div>
              </button>
              <button 
                onClick={() => setSelectedLocation('Kenkere House, Bengaluru')} 
                className={cn(
                  "px-6 py-3 rounded-xl transition-all duration-300 font-medium text-sm flex flex-col items-center gap-2",
                  selectedLocation === 'Kenkere House' 
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                    : "text-slate-800 hover:text-slate-700 hover:bg-slate-100/50"
                )}
              >
                <Users className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-bold">Kenkere House</div>
                  <div className="text-xs opacity-80">Bengaluru ({data.filter(client => {
                    const firstLoc = (client.firstVisitLocation || '').toLowerCase();
                    const homeLoc = (client.homeLocation || '').toLowerCase();
                    return firstLoc.includes('kenkere') || homeLoc.includes('kenkere') || firstLoc.includes('bengaluru') || homeLoc.includes('bengaluru') || client.firstVisitLocation === 'Kenkere House' || client.homeLocation === 'Kenkere House';
                  }).length})</div>
                </div>
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <ClientConversionMetricCards data={filteredData} onCardClick={(title, data, metricType) => setDrillDownModal({
          isOpen: true,
          client: null,
          title: `${title} - Detailed Analysis`,
          data: {
            clients: data,
            metricType
          },
          type: 'metric'
        })} />

          {/* Simplified Ranking System */}
          <ClientConversionSimplifiedRanks data={filteredData} />

          {/* Enhanced Interactive Charts - Collapsed by default */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border">
              <details className="group">
                <summary className="cursor-pointer p-4 font-semibold text-slate-800 border-b group-open:bg-gray-50">
                  📊 Interactive Charts & Visualizations
                </summary>
                <div className="p-4">
                  <ClientConversionEnhancedCharts data={filteredData} />
                </div>
              </details>
            </div>
          </div>

          {/* Data Table Selector */}
          <ClientConversionDataTableSelector activeTable={activeTable} onTableChange={setActiveTable} dataLength={filteredData.length} />

          {/* Selected Data Table */}
          <div className="space-y-8">
            {activeTable === 'monthonmonthbytype' && <ClientConversionMonthOnMonthByTypeTable data={filteredData} onRowClick={rowData => setDrillDownModal({
            isOpen: true,
            client: null,
            title: `${rowData.month} - ${rowData.type} Analysis`,
            data: rowData,
            type: 'month'
          })} />}

            {activeTable === 'monthonmonth' && <ClientConversionMonthOnMonthTable data={filteredData} onRowClick={rowData => setDrillDownModal({
            isOpen: true,
            client: null,
            title: `${rowData.month} Analysis`,
            data: rowData,
            type: 'month'
          })} />}

            {activeTable === 'yearonyear' && <ClientConversionYearOnYearTable data={filteredData} onRowClick={rowData => setDrillDownModal({
            isOpen: true,
            client: null,
            title: `${rowData.month} Year Comparison`,
            data: rowData,
            type: 'year'
          })} />}

            {activeTable === 'hostedclasses' && <ClientHostedClassesTable data={filteredData} onRowClick={rowData => setDrillDownModal({
            isOpen: true,
            client: null,
            title: `${rowData.className} - ${rowData.month}`,
            data: rowData,
            type: 'class'
          })} />}

            {activeTable === 'memberships' && <ClientConversionMembershipTable data={filteredData} />}
          </div>
        </main>

        {/* Enhanced Drill Down Modal */}
        <ClientConversionDrillDownModalV3 isOpen={drillDownModal.isOpen} onClose={() => setDrillDownModal({
        isOpen: false,
        client: null,
        title: '',
        data: null,
        type: 'month'
      })} title={drillDownModal.title} data={drillDownModal.data} type={drillDownModal.type} />
      </div>
      
      <Footer />

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>;
};
export default ClientRetention;
