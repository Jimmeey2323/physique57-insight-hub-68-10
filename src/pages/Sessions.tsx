
import React from 'react';
import { SessionsSection } from '@/components/dashboard/SessionsSection';
import { Footer } from '@/components/ui/footer';
import { SessionsFiltersProvider } from '@/contexts/SessionsFiltersContext';
import { HeroSection } from '@/components/ui/HeroSection';
import { Calendar } from 'lucide-react';

const Sessions = () => {
  return (
    <SessionsFiltersProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/20">
        <HeroSection 
          title="Sessions Analytics"
          subtitle="Comprehensive analysis of class sessions, attendance patterns, and performance insights"
          icon={Calendar}
          variant="sessions"
        />
        <main>
          <SessionsSection />
        </main>
        <Footer />
      </div>
    </SessionsFiltersProvider>
  );
};

export default Sessions;
