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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { useWeeklyHealthData } from '@/hooks/use-weekly-health-data';
import { ActivityIcon, HeartIcon, MoonIcon, DropletIcon, FlameIcon, BatteryFullIcon, BarChart3Icon } from 'lucide-react';

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
  const metricConfig: Record<string, {color: string, unit: string, name: string, icon: React.ReactNode}> = {
    steps: { color: '#4f46e5', unit: 'steps', name: 'Steps', icon: <ActivityIcon size={16} /> },
    calories: { color: '#f97316', unit: 'cal', name: 'Calories', icon: <FlameIcon size={16} /> },
    activeMinutes: { color: '#22c55e', unit: 'mins', name: 'Active Minutes', icon: <ActivityIcon size={16} /> },
    heartRate: { color: '#ef4444', unit: 'bpm', name: 'Heart Rate', icon: <HeartIcon size={16} /> },
    sleepHours: { color: '#6366f1', unit: 'hours', name: 'Sleep Hours', icon: <MoonIcon size={16} /> },
    sleepQuality: { color: '#8b5cf6', unit: '%', name: 'Sleep Quality', icon: <MoonIcon size={16} /> },
    healthScore: { color: '#10b981', unit: '', name: 'Health Score', icon: <BarChart3Icon size={16} /> },
    stressLevel: { color: '#f43f5e', unit: '', name: 'Stress Level', icon: <BatteryFullIcon size={16} /> }
  };
  
  // Choose chart type based on the metric
  const isBarMetric = ['steps', 'calories', 'activeMinutes'].includes(selectedMetric);
  const renderChart = () => {
    // Improved margins for the chart to prevent label overlapping
    const chartMargins = { top: 20, right: 30, left: 30, bottom: 20 };

    // Custom tooltip styles
    const tooltipStyle = {
      backgroundColor: '#fff',
      border: '1px solid #ccc',
      borderRadius: '6px',
      padding: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    };
    
    if (isBarMetric) {
      return (
        <BarChart
          data={chartData}
          margin={chartMargins}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            width={45}
            unit={metricConfig[selectedMetric].unit ? ` ${metricConfig[selectedMetric].unit}` : ''}
            tickLine={{ stroke: '#e5e7eb' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={tooltipStyle}
            formatter={(value) => [`${value} ${metricConfig[selectedMetric].unit}`, metricConfig[selectedMetric].name]} 
            labelStyle={{ fontWeight: 'bold', marginBottom: '5px' }}
          />
          <Legend verticalAlign="top" height={36} />
          <Bar 
            name={metricConfig[selectedMetric].name}
            type="monotone" 
            dataKey={selectedMetric} 
            fill={metricConfig[selectedMetric].color}
            stroke={metricConfig[selectedMetric].color}
            strokeWidth={2}
            radius={[4, 4, 0, 0]}
            barSize={30}
          />
        </BarChart>
      );
    } else {
      return (
        <LineChart
          data={chartData}
          margin={chartMargins}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            width={45}
            unit={metricConfig[selectedMetric].unit ? ` ${metricConfig[selectedMetric].unit}` : ''}
            tickLine={{ stroke: '#e5e7eb' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={tooltipStyle}
            formatter={(value) => [`${value} ${metricConfig[selectedMetric].unit}`, metricConfig[selectedMetric].name]} 
            labelStyle={{ fontWeight: 'bold', marginBottom: '5px' }}
          />
          <Legend verticalAlign="top" height={36} />
          <Line 
            name={metricConfig[selectedMetric].name}
            type="monotone" 
            dataKey={selectedMetric} 
            stroke={metricConfig[selectedMetric].color}
            strokeWidth={2}
            activeDot={{ r: 6 }}
            dot={{ r: 3, strokeWidth: 1 }}
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
          <Label className="text-sm font-medium mb-3 block">Select Metric:</Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(metricConfig).map(([value, { name, icon, color }]) => (
              <Button
                key={value}
                variant={selectedMetric === value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMetric(value)}
                className={`flex items-center gap-1.5 ${selectedMetric === value ? '' : 'hover:text-neutral-800 hover:border-neutral-300'}`}
                style={selectedMetric === value ? { backgroundColor: color, borderColor: color } : {}}
              >
                <span className="flex items-center justify-center">{icon}</span>
                <span>{name}</span>
              </Button>
            ))}
          </div>
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