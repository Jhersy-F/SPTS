import React from 'react';
import InstructorDashboard from '@/components/instructor/Dashboard';

export default function InstructorDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg">
          <InstructorDashboard />
        </div>
      </div>
    </div>
  );
}
