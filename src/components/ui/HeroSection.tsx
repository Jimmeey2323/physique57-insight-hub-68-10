import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  variant: 'sales' | 'client' | 'trainer' | 'sessions' | 'discounts' | 'funnel' | 'attendance' | 'powercycle' | 'expiration' | 'cancellations' | 'summary';
  showHomeButton?: boolean;
}

const gradientVariants = {
  sales: 'from-indigo-900 via-purple-800 to-indigo-700',
  client: 'from-emerald-900 via-teal-800 to-emerald-700', 
  trainer: 'from-blue-900 via-indigo-900 to-purple-900',
  sessions: 'from-orange-900 via-red-800 to-orange-700',
  discounts: 'from-amber-900 via-orange-800 to-yellow-700',
  funnel: 'from-purple-900 via-pink-800 to-purple-700',
  attendance: 'from-slate-900 via-gray-800 to-slate-700',
  powercycle: 'from-violet-900 via-purple-800 to-indigo-700',
  expiration: 'from-red-900 via-pink-800 to-red-700',
  cancellations: 'from-rose-900 via-red-800 to-rose-700',
  summary: 'from-cyan-900 via-blue-800 to-cyan-700'
};

const accentVariants = {
  sales: 'indigo-100',
  client: 'emerald-100',
  trainer: 'blue-200', 
  sessions: 'orange-100',
  discounts: 'amber-100',
  funnel: 'purple-100',
  attendance: 'slate-100',
  powercycle: 'violet-100',
  expiration: 'red-100',
  cancellations: 'rose-100',
  summary: 'cyan-100'
};

const animatedElementVariants = {
  sales: 'bg-indigo-300/20',
  client: 'bg-emerald-300/20',
  trainer: 'bg-blue-300/20',
  sessions: 'bg-orange-300/20', 
  discounts: 'bg-amber-300/20',
  funnel: 'bg-purple-300/20',
  attendance: 'bg-slate-300/20',
  powercycle: 'bg-violet-300/20',
  expiration: 'bg-red-300/20',
  cancellations: 'bg-rose-300/20',
  summary: 'bg-cyan-300/20'
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  icon: Icon,
  variant,
  showHomeButton = true
}) => {
  const navigate = useNavigate();

  return (
    <div className={`relative overflow-hidden bg-gradient-to-r ${gradientVariants[variant]} text-white`}>
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div className={`absolute top-20 right-10 w-24 h-24 ${animatedElementVariants[variant]} rounded-full animate-bounce delay-1000`}></div>
        <div className="absolute bottom-10 left-20 w-40 h-40 bg-white/5 rounded-full animate-pulse delay-500"></div>
      </div>
      
      <div className="relative px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {showHomeButton && (
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
          )}
          
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20 animate-fade-in-up">
              <Icon className="w-5 h-5" />
              <span className="font-medium">{title}</span>
            </div>
            
            <h1 className={`text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-${accentVariants[variant]} to-white bg-clip-text text-transparent animate-fade-in-up delay-200`}>
              {title}
            </h1>
            
            <p className={`text-xl text-${accentVariants[variant]} max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-300`}>
              {subtitle}
            </p>
          </div>
        </div>
      </div>

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
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};