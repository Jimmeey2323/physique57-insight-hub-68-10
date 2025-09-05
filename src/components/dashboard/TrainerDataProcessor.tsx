import { PayrollData } from '@/types/dashboard';

export interface ProcessedTrainerData {
  trainerId: string;
  trainerName: string;
  trainerEmail: string;
  location: string;
  monthYear: string;

  // Session breakdown
  totalSessions: number;
  emptySessions: number;
  nonEmptySessions: number;
  totalCustomers: number;
  totalPaid: number;

  cycleSessions: number;
  emptyCycleSessions: number;
  nonEmptyCycleSessions: number;
  cycleCustomers: number;
  cycleRevenue: number;

  strengthSessions: number;
  emptyStrengthSessions: number;
  nonEmptyStrengthSessions: number;
  strengthCustomers: number;
  strengthRevenue: number;

  barreSessions: number;
  emptyBarreSessions: number;
  nonEmptyBarreSessions: number;
  barreCustomers: number;
  barreRevenue: number;

  // Calculated metrics
  classAverageExclEmpty: number;
  classAverageInclEmpty: number;
  conversion: number;
  retention: number;

  // New data points
  uniqueKey: string;
  newMembers: number;
  convertedMembers: number;
  retainedMembers: number;
  conversionRate: number;
  retentionRate: number;
}

export const processTrainerData = (payrollData: PayrollData[]): ProcessedTrainerData[] => {
  return payrollData.map(record => {
    const totalSessions = record.totalSessions || 0;
    const emptySessions = record.totalEmptySessions || 0;
    const nonEmptySessions = record.totalNonEmptySessions || 0;
    const totalCustomers = record.totalCustomers || 0;
    const totalPaid = record.totalPaid || 0;

    // Class averages
    const classAverageExclEmpty = nonEmptySessions > 0 ? totalCustomers / nonEmptySessions : 0;
    const classAverageInclEmpty = totalSessions > 0 ? totalCustomers / totalSessions : 0;

    // Conversion & Retention
    const conversionRate = Number(record.conversion) || 0;
    const retentionRate = Number(record.retention) || 0;

    return {
      trainerId: record.teacherId,
      trainerName: record.teacherName,
      trainerEmail: record.teacherEmail,
      location: record.location,
      monthYear: record.monthYear || '',

      totalSessions,
      emptySessions,
      nonEmptySessions,
      totalCustomers,
      totalPaid,

      cycleSessions: record.cycleSessions || 0,
      emptyCycleSessions: record.emptyCycleSessions || 0,
      nonEmptyCycleSessions: record.nonEmptyCycleSessions || 0,
      cycleCustomers: record.cycleCustomers || 0,
      cycleRevenue: record.cyclePaid || 0,

      strengthSessions: 0,
      emptyStrengthSessions: 0,
      nonEmptyStrengthSessions: 0,
      strengthCustomers: 0,
      strengthRevenue: 0,

      barreSessions: record.barreSessions || 0,
      emptyBarreSessions: record.emptyBarreSessions || 0,
      nonEmptyBarreSessions: record.nonEmptyBarreSessions || 0,
      barreCustomers: record.barreCustomers || 0,
      barreRevenue: record.barrePaid || 0,

      classAverageExclEmpty,
      classAverageInclEmpty,

      conversion: record.converted || 0,
      retention: record.retained || 0,

      uniqueKey: record.unique || '',
      newMembers: 0,
      convertedMembers: record.converted || 0,
      retainedMembers: record.retained || 0,
      conversionRate,
      retentionRate,
    };
  });
};

export const getMetricValue = (data: ProcessedTrainerData, metric: string): number => {
  switch (metric) {
    case 'totalSessions': return data.totalSessions;
    case 'totalCustomers': return data.totalCustomers;
    case 'totalPaid': return data.totalPaid;
    case 'classAverageExclEmpty': return data.classAverageExclEmpty;
    case 'classAverageInclEmpty': return data.classAverageInclEmpty;
    case 'emptySessions': return data.emptySessions;
    case 'nonEmptySessions': return data.nonEmptySessions;
    case 'cycleSessions': return data.cycleSessions;
    case 'cycleRevenue': return data.cycleRevenue;
    case 'barreSessions': return data.barreSessions;
    case 'barreRevenue': return data.barreRevenue;
    case 'strengthSessions': return data.strengthSessions;
    case 'strengthRevenue': return data.strengthRevenue;
    case 'conversion': return data.conversion;
    case 'retention': return data.retention;
    case 'conversionRate': return data.conversionRate;
    case 'retentionRate': return data.retentionRate;
    case 'newMembers': return data.newMembers;
    case 'convertedMembers': return data.convertedMembers;
    case 'retainedMembers': return data.retainedMembers;
    default: return 0;
  }
};
