import React, { useState } from 'react';
import { Plus, Watch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getGreeting } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';
import { AddHealthDataModal } from './add-health-data-modal';

export function WelcomeSection() {
  const { user } = useAuth();
  const greeting = getGreeting(user?.firstName || 'User');
  const [isAddDataModalOpen, setIsAddDataModalOpen] = useState(false);

  const openAddDataModal = () => setIsAddDataModalOpen(true);
  const closeAddDataModal = () => setIsAddDataModalOpen(false);

  return (
    <section className="mb-8">
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 border-none">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-headings font-semibold text-neutral-800 dark:text-white">
                {greeting}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-200 mt-1">
                Your health score has improved by 5% this week. Keep up the good work!
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                className="px-4 py-2 bg-primary text-white rounded-md flex items-center text-sm font-medium hover:bg-primary-dark transition-colors"
                onClick={openAddDataModal}
              >
                <Plus size={16} className="mr-2" />
                Add Health Data
              </Button>
              <Link href="/connected-devices">
                <Button 
                  variant="outline" 
                  className="px-4 py-2 bg-white dark:bg-neutral-600 text-neutral-700 dark:text-white border border-neutral-200 dark:border-neutral-500 rounded-md flex items-center text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-500 transition-colors"
                >
                  <Watch size={16} className="mr-2" />
                  Sync Devices
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Health Data Modal */}
      <AddHealthDataModal 
        isOpen={isAddDataModalOpen} 
        onClose={closeAddDataModal} 
      />
    </section>
  );
}
