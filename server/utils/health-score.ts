import { HealthData } from '@shared/schema';

export function calculateHealthScore(data: Partial<HealthData>): number {
  // Initialize score components
  let activityScore = 0;
  let sleepScore = 0;
  let heartRateScore = 0;
  let stressScore = 0;

  // Calculate activity score (40% of total)
  if (data.steps !== undefined) {
    // Steps component (20%)
    const stepsScore = Math.min((data.steps / 10000) * 20, 20);
    activityScore += stepsScore;
  }

  if (data.activeMinutes !== undefined) {
    // Active minutes component (20%)
    const activeMinutesScore = Math.min((data.activeMinutes / 60) * 20, 20);
    activityScore += activeMinutesScore;
  }

  // Calculate sleep score (30% of total)
  if (data.sleepHours !== undefined) {
    // Sleep duration component (15%)
    const sleepHoursScore = Math.min((data.sleepHours / 8) * 15, 15);
    sleepScore += sleepHoursScore;
  }

  if (data.sleepQuality !== undefined) {
    // Sleep quality component (15%)
    const sleepQualityScore = (data.sleepQuality / 100) * 15;
    sleepScore += sleepQualityScore;
  }

  // Calculate heart rate score (20% of total)
  if (data.heartRate !== undefined) {
    // Normal resting heart rate is between 60-100 bpm
    // Score decreases as heart rate deviates from optimal range
    const optimalHeartRate = 70;
    const deviation = Math.abs(data.heartRate - optimalHeartRate);
    heartRateScore = Math.max(20 - (deviation * 0.5), 0);
  }

  // Calculate stress score (10% of total)
  if (data.stressLevel !== undefined) {
    // Lower stress level is better
    stressScore = Math.max(10 - (data.stressLevel * 0.5), 0);
  }

  // Calculate total score
  const totalScore = Math.round(activityScore + sleepScore + heartRateScore + stressScore);

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, totalScore));
} 