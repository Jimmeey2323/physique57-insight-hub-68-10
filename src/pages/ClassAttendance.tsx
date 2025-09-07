
import React from 'react';
import { ClassAttendanceSection } from '@/components/dashboard/ClassAttendanceSection';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Calendar } from 'lucide-react';
import { Footer } from '@/components/ui/footer';
import { SessionsFiltersProvider } from '@/contexts/SessionsFiltersContext';

const ClassAttendance = () => {
  const navigate = useNavigate();

  return (
    <SessionsFiltersProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 text-white">
          <div className="absolute inset-0 bg-black/20" />
          
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute top-20 right-10 w-24 h-24 bg-indigo-300/20 rounded-full animate-bounce delay-1000"></div>
            <div className="absolute bottom-10 left-20 w-40 h-40 bg-purple-300/10 rounded-full animate-pulse delay-500"></div>
          </div>
          
          <div className="relative px-8 py-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <Button 
                  onClick={() => navigate('/')} 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200"
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </Button>
              </div>
              
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Attendance Analytics</span>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent">
                  Class Attendance
                </h1>
                
                <p className="text-xl text-indigo-100 max-w-2xl mx-auto leading-relaxed">
                  Comprehensive class utilization and attendance trend analysis across all sessions
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <main className="space-y-8">
            <ClassAttendanceSection />
          </main>
        </div>
        
        <Footer />
      </div>
    </SessionsFiltersProvider>
  );
};

export default ClassAttendance;
