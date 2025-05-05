import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, RotateCcw, AlertTriangle, ShieldCheck, Database, Lock } from 'lucide-react';
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
    <Card className="shadow-md border-slate-200 dark:border-slate-700 overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 dark:from-slate-800 dark:via-slate-800/90 dark:to-indigo-950/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-3">
              <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-200">Data Management</CardTitle>
              <CardDescription className="text-xs mt-0.5 text-slate-500 dark:text-slate-400">
                HIPAA-compliant security
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-4 flex-grow">
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/80">
              <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center">
                <Database className="h-3 w-3 mr-1.5" />
                Health Data Actions
              </h4>
            </div>
            <div className="p-3 space-y-3 bg-white dark:bg-slate-900">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start bg-white dark:bg-slate-900 border-red-100 dark:border-red-900/30 hover:bg-red-50 hover:dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-md group"
                    disabled={isDeletingHealthData || !healthData}
                  >
                    <div className="h-6 w-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-2 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                      <Trash2 size={14} className="text-red-600 dark:text-red-400" />
                    </div>
                    <span>Delete Current Health Data</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-red-200 dark:border-red-900/30 shadow-lg">
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Trash2 size={24} className="text-red-600 dark:text-red-400" />
                  </div>
                  <AlertDialogHeader className="pt-6">
                    <AlertDialogTitle className="text-center text-red-600 dark:text-red-400 text-xl">
                      Delete Health Data
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center">
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
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start bg-white dark:bg-slate-900 border-amber-100 dark:border-amber-900/30 hover:bg-amber-50 hover:dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 rounded-md group"
              >
                <div className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-2 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
                  <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400" />
                </div>
                <span>Mark Data as Inaccurate</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start bg-white dark:bg-slate-900 border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 hover:dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-md group"
              >
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <RotateCcw size={14} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span>Refresh from Devices</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
          <Lock size={12} className="mr-1" />
          <span>HIPAA Secured</span>
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500">
          Data updated: {new Date().toLocaleDateString()}
        </div>
      </CardFooter>
    </Card>
  );
}
