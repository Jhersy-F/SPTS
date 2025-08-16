'use client';
import React from 'react';
import Sidebar from '@/components/instructor/Sidebar';
import { SessionProvider } from 'next-auth/react';
export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-screen">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
    
    </SessionProvider>
  );
}
