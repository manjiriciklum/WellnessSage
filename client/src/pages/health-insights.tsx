import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AiInsights } from '@/components/dashboard/ai-insights';
import { HealthOverview } from '@/components/dashboard/health-overview';
import { HealthTrends } from '@/components/dashboard/health-trends';

export default function HealthInsightsPage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-headings font-bold mb-6">Health Insights</h1>
      
      <HealthOverview />
      
      <AiInsights />
      
      <section className="mb-8">
        <h2 className="text-lg font-headings font-semibold text-neutral-800 dark:text-white mb-4">Health Trends</h2>
        <HealthTrends />
      </section>
    </div>
  );
}
