import React, { useEffect } from 'react';
import { WelcomeSection } from '@/components/dashboard/welcome-section';
import { HealthOverview } from '@/components/dashboard/health-overview';
import { AiInsights } from '@/components/dashboard/ai-insights';
import { FindDoctor } from '@/components/dashboard/find-doctor';
import { RemindersAndGoals } from '@/components/dashboard/reminders-goals';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

export default function Dashboard() {
  // Generate demo data on initial load
  useEffect(() => {
    const initializeDemoData = async () => {
      try {
        await apiRequest('POST', '/api/demo/generate-data');
        
        // Invalidate queries to fetch fresh data
        queryClient.invalidateQueries();
      } catch (error) {
        console.error('Failed to initialize demo data', error);
      }
    };
    
    initializeDemoData();
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <WelcomeSection />
      
      {/* Top section - Health overview */}
      <div className="mt-8">
        <HealthOverview />
      </div>
      
      {/* Middle section - AI Insights */}
      <div className="mt-8">
        <AiInsights />
      </div>
      
      {/* Bottom section - Stacked layout for Find Doctor and Reminders/Goals */}
      <div className="mt-8 space-y-8">
        <div>
          <FindDoctor />
        </div>
        <div>
          <RemindersAndGoals />
        </div>
      </div>
    </div>
  );
}
