import React from 'react';
import { SalesAnalyticsSection } from '@/components/dashboard/SalesAnalyticsSection';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { Footer } from '@/components/ui/footer';
import { GlobalFiltersProvider } from '@/contexts/GlobalFiltersContext';

const SalesAnalytics = () => {
  const { data } = useGoogleSheets();

  return (
    <GlobalFiltersProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
        <SalesAnalyticsSection data={data} />
        <Footer />
      </div>
    </GlobalFiltersProvider>
  );
};

export default SalesAnalytics;