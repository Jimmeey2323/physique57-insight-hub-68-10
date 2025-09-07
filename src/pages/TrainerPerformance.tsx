import React, { useEffect } from 'react';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { ProfessionalLoader } from '@/components/dashboard/ProfessionalLoader';
import { EnhancedTrainerPerformanceSection } from '@/components/dashboard/EnhancedTrainerPerformanceSection';
import { Footer } from '@/components/ui/footer';
import { HeroSection } from '@/components/ui/HeroSection';
import { Users } from 'lucide-react';
import { usePayrollData } from '@/hooks/usePayrollData';

const TrainerPerformance = () => {
  const { data: payrollData, isLoading } = usePayrollData();
  const { isLoading: globalLoading, setLoading } = useGlobalLoading();

  useEffect(() => {
    setLoading(isLoading, 'Analyzing trainer performance metrics and insights...');
  }, [isLoading, setLoading]);

  if (globalLoading) {
    return <ProfessionalLoader variant="analytics" subtitle="Analyzing trainer performance metrics and insights..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <HeroSection 
        title="Trainer Performance Analytics"
        subtitle="Comprehensive trainer performance metrics, insights, and development opportunities"
        icon={Users}
        variant="trainer"
      />

      <div className="container mx-auto px-6 py-8">
        <main className="space-y-8">
          <EnhancedTrainerPerformanceSection />
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default TrainerPerformance;