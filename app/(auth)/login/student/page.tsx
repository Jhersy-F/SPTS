import React from 'react';
import StudentLogin from '@/components/auth/StudentLogin';

export default function StudentLoginPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-center mb-8">Student Login</h1>
            <StudentLogin />
          </div>
        </div>
      </div>
    </div>
  );
}
