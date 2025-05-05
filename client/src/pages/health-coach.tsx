import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ArrowLeft } from 'lucide-react';
import { HealthCoachChat } from '@/components/health-coach/chat';

export default function HealthCoachPage() {
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
          <div className="md:col-span-2 h-[600px]">
            <HealthCoachChat />
          </div>
          
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Heart size={18} className="text-neutral-500" />
                <h3 className="font-medium">Chat Tips</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-green-100 p-1 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  </div>
                  <span>Ask specific questions about health topics</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-green-100 p-1 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  </div>
                  <span>Be descriptive when asking about symptoms</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-green-100 p-1 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  </div>
                  <span>This is not a substitute for professional medical advice</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-green-100 p-1 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  </div>
                  <span>For emergencies, contact a healthcare provider immediately</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <Card className="shadow-sm mt-4 p-4">
          <div className="text-center">
            <h2 className="text-lg font-medium mb-2">AI-Powered Health Assistant</h2>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto">
              Our Health Coach AI uses advanced technology to provide general health information, answer questions about wellness topics, and offer basic guidance. Remember that while the AI can provide helpful information, it's not a substitute for consultation with a qualified healthcare professional.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}