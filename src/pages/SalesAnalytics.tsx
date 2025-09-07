import React from 'react';
import { SalesAnalyticsSection } from '@/components/dashboard/SalesAnalyticsSection';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { Footer } from '@/components/ui/footer';
import { HeroSection } from '@/components/ui/HeroSection';
import { TrendingUp } from 'lucide-react';

const SalesAnalytics = () => {
  const { data } = useGoogleSheets();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      <HeroSection 
        title="Sales Analytics"
        subtitle="Comprehensive analysis of sales performance, revenue trends, and customer insights"
        icon={TrendingUp}
        variant="sales"
      />

      <div className="container mx-auto px-6 py-8">
        <main className="space-y-8">
          <SalesAnalyticsSection data={data} />
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default SalesAnalytics;
