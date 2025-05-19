import { type AiInsight } from '@shared/schema';

export const mockAiInsights = (userId: string | number): AiInsight[] => [
  {
    id: 1,
    userId: userId,
    title: 'Stress Management Recommendation',
    description: 'Your heart rate variability has decreased this week, which may indicate increased stress levels. Consider adding 10-minute meditation sessions in the morning.',
    category: 'stress',
    action: 'View Plan',
    createdAt: new Date(),
    isRead: false
  },
  {
    id: 2,
    userId: userId,
    title: 'Nutrition Improvement',
    description: 'Based on your food logging patterns, we notice you may benefit from increasing protein intake in the morning. This could help sustain energy levels throughout the day.',
    category: 'nutrition',
    action: 'See Suggestions',
    createdAt: new Date(),
    isRead: false
  },
  {
    id: 3,
    userId: userId,
    title: 'Fitness Progress Alert',
    description: "Great job on your consistency! You've met your step goal 5 days in a row. Consider increasing your daily step target by 10% to continue improving cardiovascular health.",
    category: 'fitness',
    action: 'Adjust Goals',
    createdAt: new Date(),
    isRead: false
  }
]; 