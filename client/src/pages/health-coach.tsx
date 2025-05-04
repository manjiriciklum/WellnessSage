import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

type HealthConsultation = {
  id: number;
  userId: number;
  symptoms: string;
  analysis: string;
  recommendations: string;
  severity: string;
  createdAt: string;
};

export default function HealthCoachPage() {
  const [symptoms, setSymptoms] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch existing consultations
  const { data: consultations, isLoading: isLoadingConsultations } = useQuery<HealthConsultation[]>({
    queryKey: ['/api/users/1/health-consultations'],
    refetchOnWindowFocus: false,
  });

  // Mutation for analyzing symptoms
  const { mutate: analyzeSymptoms, isPending } = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/health-coach/analyze-symptoms', {
        userId: 1, // Using default demo user ID
        symptoms,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Analysis complete',
        description: 'Your symptoms have been analyzed.',
      });
      setSymptoms('');
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/health-consultations'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to analyze symptoms. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your symptoms',
        variant: 'destructive',
      });
      return;
    }
    analyzeSymptoms();
  };

  // Function to get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Health Coach AI</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Describe Your Symptoms</CardTitle>
            <CardDescription>
              Tell us what you're experiencing and our AI will analyze your symptoms and provide recommendations.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <Textarea
                placeholder="Describe your symptoms in detail (e.g., I've had a headache for the past 3 days, concentrated on the right side of my head. It gets worse when I stand up quickly.)"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={5}
                className="w-full resize-none"
              />
              <p className="mt-2 text-sm text-gray-500">
                This is not a substitute for professional medical advice. If you're experiencing severe symptoms, please seek immediate medical attention.
              </p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Symptoms'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Previous Consultations</h2>
          {isLoadingConsultations ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : consultations && consultations.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {[...consultations]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((consultation) => (
                  <Card key={consultation.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <CardTitle className="text-lg">Consultation #{consultation.id}</CardTitle>
                          <CardDescription>
                            {new Date(consultation.createdAt).toLocaleString()}
                          </CardDescription>
                        </div>
                        <Badge className={getSeverityColor(consultation.severity)}>
                          {consultation.severity.charAt(0).toUpperCase() + consultation.severity.slice(1)} Severity
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Symptoms Reported</h3>
                        <p className="mt-1">{consultation.symptoms}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Analysis</h3>
                        <p className="mt-1">{consultation.analysis}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Recommendations</h3>
                        <p className="mt-1">{consultation.recommendations}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-gray-500 mb-2">No consultations yet</p>
                <p className="text-sm text-gray-400">Describe your symptoms above to get started</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}