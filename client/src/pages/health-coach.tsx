import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Heart, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-800">
      <header className="bg-white dark:bg-neutral-700 p-4 flex items-center border-b border-neutral-100 dark:border-neutral-600 shadow-sm">
        <Link href="/">
          <Button variant="ghost" className="mr-2">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-xl font-headings font-semibold text-neutral-800 dark:text-white ml-4">Health Coach</h1>
      </header>
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-sm md:col-span-2">
            <CardContent className="p-5">
              <form onSubmit={handleSubmit}>
                <h3 className="text-lg font-medium mb-3">Describe Your Symptoms</h3>
                <Textarea
                  placeholder="Describe your symptoms in detail (e.g., I've had a headache for the past 3 days, concentrated on the right side of my head. It gets worse when I stand up quickly.)"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={5}
                  className="w-full resize-none mb-4"
                />
                <p className="text-sm text-gray-500 mb-4">
                  This is not a substitute for professional medical advice. If you're experiencing severe symptoms, please seek immediate medical attention.
                </p>
                <div className="flex justify-end">
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
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Heart size={18} className="text-neutral-500" />
                <h3 className="font-medium">Health Tips</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-green-100 p-1 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  </div>
                  <span>Be specific about when symptoms started</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-green-100 p-1 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  </div>
                  <span>Mention if symptoms are constant or intermittent</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-green-100 p-1 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  </div>
                  <span>Include any relevant medical history</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-green-100 p-1 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  </div>
                  <span>Describe any self-treatment you've tried</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8 mb-4">
          <h2 className="text-xl font-medium mb-4">Previous Consultations</h2>
          {isLoadingConsultations ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : consultations && consultations.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[...consultations]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((consultation) => (
                  <Card key={consultation.id} className="overflow-hidden shadow-sm">
                    <CardHeader className="pb-2">
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
                    <CardContent className="space-y-3 pt-2">
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Symptoms Reported</h3>
                        <p className="mt-1 text-sm">{consultation.symptoms}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Analysis</h3>
                        <p className="mt-1 text-sm">{consultation.analysis}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Recommendations</h3>
                        <p className="mt-1 text-sm">{consultation.recommendations}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card className="shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-gray-500 mb-2">No consultations yet</p>
                <p className="text-sm text-gray-400">Describe your symptoms above to get started</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}