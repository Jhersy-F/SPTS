import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return <p>Not authenticated</p>;
  }
  console.log(session);
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Welcome, {session.user.name || session.user.firstName}!
            </h1>
            <p className="text-xl text-gray-600">
              Student Number: {session.user.studentNumber || session.user.id}
            </p>
          </div>
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Dashboard</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-gray-700 mb-2">Student Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-600">Full Name:</span>
                      <p className="text-gray-800">{session.user.name || `${session.user.firstName}`}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Student Number:</span>
                      <p className="text-gray-800">{session.user.studentNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Role:</span>
                      <p className="text-gray-800 capitalize">{session.user.role}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-gray-700 mb-2">Quick Actions</h3>
                  <div className="space-y-2">
                    <p className="text-gray-600">Access your student portal features and manage your academic information.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
