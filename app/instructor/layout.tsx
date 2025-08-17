'use client';
import React from 'react';
import Sidebar from '@/components/instructor/Sidebar';
import { SessionProvider } from 'next-auth/react';
import TopBar from '@/components/instructor/topbar';
export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-screen">
        <div className="flex-col w-full">
               <TopBar />
                <section>
                    {children}
                </section>
            </div>
        </main>
      </div>
    </div>
    
    </SessionProvider>
  );
}
