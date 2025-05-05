import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
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
    <Card className="shadow-md border-slate-200 dark:border-slate-700 overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700">
        <div className="flex items-center">
          <ShieldCheck className="h-5 w-5 text-indigo-500 mr-2" />
          <CardTitle className="text-sm font-semibold">Health Data Management</CardTitle>
        </div>
        <CardDescription className="text-xs mt-1">
          Securely manage your personal health information
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-4">
        <div className="space-y-3">
          <div className="p-0.5 rounded-lg bg-gradient-to-r from-rose-100 to-red-100 dark:from-rose-900/30 dark:to-red-900/30">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start bg-white dark:bg-slate-900 border-transparent hover:bg-red-50 hover:dark:bg-slate-800 text-red-600 dark:text-red-400 rounded-md"
                  disabled={isDeletingHealthData || !healthData}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Current Health Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-red-200 dark:border-red-900">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-600 dark:text-red-400 flex items-center">
                    <Trash2 size={18} className="mr-2" />
                    Delete Health Data
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your health data record
                    and remove it from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={confirmDelete}
                    className="bg-red-600 hover:bg-red-700 text-white border-transparent"
                  >
                    {isDeletingHealthData ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <div className="p-0.5 rounded-lg bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start bg-white dark:bg-slate-900 border-transparent hover:bg-amber-50 hover:dark:bg-slate-800 text-amber-600 dark:text-amber-400 rounded-md"
            >
              <AlertTriangle size={16} className="mr-2" />
              Mark Data as Inaccurate
            </Button>
          </div>
          
          <div className="p-0.5 rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start bg-white dark:bg-slate-900 border-transparent hover:bg-blue-50 hover:dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-md"
            >
              <RotateCcw size={16} className="mr-2" />
              Refresh from Devices
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
