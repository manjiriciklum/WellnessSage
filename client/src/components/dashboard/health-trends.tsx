import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useWeeklyHealthData } from '@/hooks/use-weekly-health-data';

export function HealthTrends() {
  const { processedData, isLoading, error } = useWeeklyHealthData();
  const [selectedMetric, setSelectedMetric] = useState('steps');
  
  // Format data for charts
  const chartData = processedData.labels.map((label, index) => {
    const dataPoint: Record<string, any> = { name: label };
    
    // Add all the metrics to the data point
    Object.keys(processedData.datasets).forEach(metric => {
      dataPoint[metric] = processedData.datasets[metric as keyof typeof processedData.datasets][index];
    });
    
    return dataPoint;
  });
  
  // Define colors and units for different metrics
  const metricConfig: Record<string, {color: string, unit: string, name: string}> = {
    steps: { color: '#4f46e5', unit: 'steps', name: 'Steps' },
    calories: { color: '#f97316', unit: 'cal', name: 'Calories' },
    activeMinutes: { color: '#22c55e', unit: 'mins', name: 'Active Minutes' },
    heartRate: { color: '#ef4444', unit: 'bpm', name: 'Heart Rate' },
    sleepHours: { color: '#6366f1', unit: 'hours', name: 'Sleep Hours' },
    sleepQuality: { color: '#8b5cf6', unit: '%', name: 'Sleep Quality' },
    healthScore: { color: '#10b981', unit: '', name: 'Health Score' },
    stressLevel: { color: '#f43f5e', unit: '', name: 'Stress Level' }
  };
  
  // Choose chart type based on the metric
  const isBarMetric = ['steps', 'calories', 'activeMinutes'].includes(selectedMetric);
  const renderChart = () => {
    if (isBarMetric) {
      return (
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="name" />
          <YAxis 
            unit={metricConfig[selectedMetric].unit}
            label={{ 
              value: metricConfig[selectedMetric].name, 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }} 
          />
          <Tooltip formatter={(value) => [`${value} ${metricConfig[selectedMetric].unit}`, metricConfig[selectedMetric].name]} />
          <Legend />
          <Bar 
            type="monotone" 
            dataKey={selectedMetric} 
            fill={metricConfig[selectedMetric].color}
            stroke={metricConfig[selectedMetric].color}
            strokeWidth={2}
          />
        </BarChart>
      );
    } else {
      return (
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="name" />
          <YAxis 
            unit={metricConfig[selectedMetric].unit}
            label={{ 
              value: metricConfig[selectedMetric].name, 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }} 
          />
          <Tooltip formatter={(value) => [`${value} ${metricConfig[selectedMetric].unit}`, metricConfig[selectedMetric].name]} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey={selectedMetric} 
            stroke={metricConfig[selectedMetric].color}
            strokeWidth={2}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      );
    }
  };
  
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-5 flex items-center justify-center h-[300px]">
          <p className="text-neutral-500 dark:text-neutral-400">Loading health trends...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <p className="text-red-500">Error loading health trends</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!processedData.labels.length) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <p className="text-neutral-600 dark:text-neutral-200">
            No health data available for this week. Data will appear as it's collected from your wearable devices.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Your Weekly Health Data</CardTitle>
        <CardDescription>
          View your health data for the current week
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-5">
          <Label className="text-sm font-medium mb-2 block">Select Metric:</Label>
          <RadioGroup 
            value={selectedMetric} 
            onValueChange={setSelectedMetric}
            className="flex flex-wrap gap-2"
            defaultValue="steps"
          >
            {Object.entries(metricConfig).map(([value, { name }]) => (
              <div key={value} className="flex items-center space-x-1">
                <RadioGroupItem value={value} id={value} />
                <Label htmlFor={value} className="text-sm font-normal cursor-pointer">{name}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}