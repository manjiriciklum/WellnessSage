import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { useHealthData } from '@/hooks/use-health-data';
import { formatDuration } from '@/lib/utils';

export function SleepMetrics() {
  const { healthData } = useHealthData();

  /* ────────── derive values ────────── */
  const sleepHours       = healthData?.sleepHours   ?? 0;
  const sleepQuality     = healthData?.sleepQuality ?? 0;   // 0‒100
  const deepSleepHours   = sleepHours * 0.375;

  const sleepTrend       = sleepQuality > 70 ? 'Improving' : 'Declining';
  const trendColor       = sleepTrend === 'Improving'
    ? 'bg-success/10 text-success'
    : 'bg-error/10 text-error';
  const trendValue       = sleepTrend === 'Improving' ? '+8%' : '-8%';

  /* ────────── mock samples for chart (every 45 min) ────────── */
  const chartData = useMemo(
    () => Array.from({ length: 9 }, (_, i) => {
      const pct = Math.max(20, Math.min(100,
        sleepQuality + (Math.sin(i / 1.5) * 20)   // little wave
      ));
      return { t: i * 0.75, q: Math.round(pct) };  // t in h
    }),
    [sleepQuality],
  );

  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        {/* ─────────── header ─────────── */}
        <div className="flex justify-between mb-2">
          <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-200">
            Sleep Quality
          </h3>
          <span className={`text-xs ${trendColor} px-2 py-1 rounded-full flex items-center`}>
            <svg className="w-3 h-3 mr-0.5" viewBox="0 0 24 24" fill="none">
              {sleepTrend === 'Improving' ? (
                <path d="M12 19V5L5 12M12 5l7 7"
                      stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M12 5v14l-7-7m7 7l7-7"
                      stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
            {trendValue}
          </span>
        </div>

        {/* ─────────── area chart ─────────── */}
        <div className="my-3 h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="rgb(126,87,194)" stopOpacity={0.5}/>
                  <stop offset="100%" stopColor="rgb(126,87,194)" stopOpacity={0.05}/>
                </linearGradient>
              </defs>

              <XAxis dataKey="t" hide />
              <YAxis hide domain={[0, 100]} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05}/>
              <Tooltip
                contentStyle={{ fontSize: '0.75rem' }}
                formatter={(v) => [`${v}%`, 'Quality']}
                labelFormatter={(l) => `${l.toFixed(2)} h`}
              />
              <Area
                type="monotone"
                dataKey="q"
                stroke="rgb(126,87,194)"
                fill="url(#sleepGrad)"
                strokeWidth={2}
                isAnimationActive
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ─────────── metrics row ─────────── */}
        <div className="flex items-center justify-between">
          {[
            { label: 'Total',   val: formatDuration(sleepHours) },
            { label: 'Deep',    val: formatDuration(deepSleepHours) },
            { label: 'Quality', val: `${sleepQuality}%` },
          ].map(({ label, val }) => (
            <div key={label} className="text-center">
              <span className="text-xs text-neutral-500 dark:text-neutral-300">{label}</span>
              <p className="text-lg font-medium text-neutral-700 dark:text-neutral-100">{val}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
