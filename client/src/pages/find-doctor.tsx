import React, { useState } from 'react';
import { FindDoctor } from '@/components/dashboard/find-doctor';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Search, MapPin, Calendar as CalendarIcon } from 'lucide-react';

export default function FindDoctorPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-headings font-bold mb-6">Find a Doctor</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-sm md:col-span-2">
          <CardContent className="p-5">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                <Input 
                  placeholder="Search by specialty, name..." 
                  className="pl-10"
                />
              </div>
              <div className="relative flex-1 min-w-[180px]">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                <Input 
                  defaultValue="San Francisco, CA" 
                  className="pl-10"
                />
              </div>
              <Button>
                Search
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon size={18} className="text-neutral-500" />
              <h3 className="font-medium">Schedule Appointment</h3>
            </div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border mb-4"
            />
            <Button className="w-full">Check Availability</Button>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all">
        <div className="flex items-center mb-6">
          <TabsList>
            <TabsTrigger value="all">All Specialties</TabsTrigger>
            <TabsTrigger value="primary">Primary Care</TabsTrigger>
            <TabsTrigger value="cardiology">Cardiology</TabsTrigger>
            <TabsTrigger value="mental">Mental Health</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all">
          <FindDoctor />
        </TabsContent>
        
        <TabsContent value="primary">
          <div className="text-center p-8">
            <p className="text-neutral-600 dark:text-neutral-200">
              Primary Care doctors will appear here.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="cardiology">
          <div className="text-center p-8">
            <p className="text-neutral-600 dark:text-neutral-200">
              Cardiologists will appear here.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="mental">
          <div className="text-center p-8">
            <p className="text-neutral-600 dark:text-neutral-200">
              Mental Health specialists will appear here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
