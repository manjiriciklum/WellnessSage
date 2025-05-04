import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(100, (current / target) * 100);
}

export function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

export function getColorForCategory(category: string): string {
  const categories: Record<string, string> = {
    stress: 'primary',
    nutrition: 'secondary',
    fitness: 'accent',
    medication: 'error',
    hydration: 'primary',
    wellness: 'secondary',
    sleep: 'accent',
    exercise: 'primary',
    meditation: 'secondary'
  };
  
  return categories[category] || 'primary';
}

export function getIconForCategory(category: string): string {
  const categories: Record<string, string> = {
    stress: 'psychology',
    nutrition: 'restaurant',
    fitness: 'fitness_center',
    medication: 'medical_services',
    hydration: 'water_drop',
    wellness: 'spa',
    sleep: 'bedtime',
    exercise: 'directions_run',
    meditation: 'self_improvement'
  };
  
  return categories[category] || 'info';
}

export function getGreeting(name: string): string {
  const timeOfDay = getTimeOfDay();
  return `Good ${timeOfDay}, ${name}!`;
}
