import React, { useEffect } from 'react';
import { WelcomeSection } from '@/components/dashboard/welcome-section';
import { HealthOverview } from '@/components/dashboard/health-overview';
import { AiInsights } from '@/components/dashboard/ai-insights';
import { FindDoctor } from '@/components/dashboard/find-doctor';
import { RemindersAndGoals } from '@/components/dashboard/reminders-goals';
import { HealthActions } from '@/components/dashboard/health-actions';
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
    <div className="p-4 md:p-6">
      <WelcomeSection />
      <HealthOverview />
      <AiInsights />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FindDoctor />
        <div className="md:col-span-1">
          <RemindersAndGoals />
        </div>
        <HealthActions />
      </div>
    </div>
  );
}
