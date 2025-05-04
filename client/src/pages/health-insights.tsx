import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AiInsights } from '@/components/dashboard/ai-insights';
import { HealthOverview } from '@/components/dashboard/health-overview';

export default function HealthInsightsPage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-headings font-bold mb-6">Health Insights</h1>
      
      <HealthOverview />
      
      <AiInsights />
      
      <section className="mb-8">
        <h2 className="text-lg font-headings font-semibold text-neutral-800 dark:text-white mb-4">Health Trends</h2>
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <p className="text-neutral-600 dark:text-neutral-200">
              Trends visualization will appear here in the complete implementation.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
