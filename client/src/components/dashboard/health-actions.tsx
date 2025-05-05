import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useHealthData } from '@/hooks/use-health-data';

export function HealthActions() {
  const { healthData, deleteHealthData, isDeletingHealthData } = useHealthData();
  
  const confirmDelete = () => {
    if (healthData?.id) {
      deleteHealthData(healthData.id);
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-200 mb-4">Health Data Management</h3>
        
        <div className="space-y-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
                disabled={isDeletingHealthData || !healthData}
              >
                <Trash2 size={16} className="mr-2" />
                Delete Current Health Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to delete this health data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your health data record
                  and remove it from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeletingHealthData ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-600"
          >
            <AlertTriangle size={16} className="mr-2" />
            Mark Data as Inaccurate
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600"
          >
            <RotateCcw size={16} className="mr-2" />
            Refresh from Devices
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
