import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHealthData } from '@/hooks/use-health-data';
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
import { Trash2, RotateCcw, AlertTriangle, Database, Lock, Download, Upload, User, Settings } from 'lucide-react';

export function ActionMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { healthData, deleteHealthData, isDeletingHealthData } = useHealthData();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const confirmDelete = () => {
    if (healthData?.id) {
      deleteHealthData(healthData.id);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-neutral-500 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded-full"
        onClick={toggleMenu}
      >
        <span className="sr-only">Open menu</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="1"/>
          <circle cx="12" cy="5" r="1"/>
          <circle cx="12" cy="19" r="1"/>
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 z-50 origin-top-right">
          <Card className="shadow-lg border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/80">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                  <Database className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  Health Data Management
                </h4>
              </div>
              
              <div className="p-0">
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-none border-0 h-auto p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/70"
                >
                  <Trash2 size={16} className="mr-2 text-red-500" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Delete Health Data</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Remove current health records</span>
                  </div>
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-none border-0 h-auto p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/70"
                >
                  <AlertTriangle size={16} className="mr-2 text-amber-500" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Mark as Inaccurate</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Flag suspicious readings</span>
                  </div>
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-none border-0 h-auto p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/70"
                >
                  <Download size={16} className="mr-2 text-blue-500" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Export Health Records</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Download your data in CSV format</span>
                  </div>
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-none border-0 h-auto p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/70"
                >
                  <Upload size={16} className="mr-2 text-green-500" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Import Health Data</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Upload from external providers</span>
                  </div>
                </Button>
              </div>
              
              <div className="p-0">
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-none border-0 h-auto p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/70"
                >
                  <User size={16} className="mr-2 text-violet-500" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Privacy Settings</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Manage data sharing preferences</span>
                  </div>
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-none border-0 h-auto p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/70"
                >
                  <Settings size={16} className="mr-2 text-slate-500" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Data Management Settings</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Configure retention policies</span>
                  </div>
                </Button>
              </div>
              
              <div className="p-2 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                <Lock size={12} className="mr-1" />
                <span>HIPAA Secured & Encrypted</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}