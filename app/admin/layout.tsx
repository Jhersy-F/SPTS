'use client';
import React from 'react';
import AdminSidebar from '@/components/admin/Sidebar';
import { SessionProvider } from 'next-auth/react';
import TopBar from '@/components/instructor/topbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-100">
        <div className="flex">
          <AdminSidebar />
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
