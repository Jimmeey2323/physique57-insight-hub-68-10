import React, { useMemo } from 'react';
import { ClassAttendanceSection } from '@/components/dashboard/ClassAttendanceSection';
import { Footer } from '@/components/ui/footer';
import { SessionsFiltersProvider } from '@/contexts/SessionsFiltersContext';
import { ModernHeroSection } from '@/components/ui/ModernHeroSection';
import { useSessionsData } from '@/hooks/useSessionsData';
import { useFilteredSessionsData } from '@/hooks/useFilteredSessionsData';
import { formatNumber } from '@/utils/formatters';

const ClassAttendanceContent = () => {
  const { data } = useSessionsData();
  const filteredData = useFilteredSessionsData(data || []);

  const heroMetrics = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    const locations = [
      { key: 'Kwality House, Kemps Corner', name: 'Kwality' },
      { key: 'Supreme HQ, Bandra', name: 'Supreme' },
      { key: 'Kenkere House', name: 'Kenkere' }
    ];

    return locations.map(location => {
      const locationData = filteredData.filter(item => 
        location.key === 'Kenkere House' 
          ? item.location?.includes('Kenkere') || item.location === 'Kenkere House'
          : item.location === location.key
      );
      
      const totalSessions = locationData.length;
      
      return {
        location: location.name,
        label: 'Filtered Sessions',
        value: formatNumber(totalSessions)
      };
    });
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      <ModernHeroSection 
        title="Class Attendance Analytics"
        subtitle="Comprehensive class utilization and attendance trend analysis across all sessions"
        variant="attendance"
        metrics={heroMetrics}
        onExport={() => console.log('Exporting attendance data...')}
      />

      <div className="container mx-auto px-6 py-8">
        <ClassAttendanceSection />
      </div>
      
      <Footer />
    </div>
  );
};

const ClassAttendance = () => {
  return (
    <SessionsFiltersProvider>
      <ClassAttendanceContent />
    </SessionsFiltersProvider>
  );
};

export default ClassAttendance;