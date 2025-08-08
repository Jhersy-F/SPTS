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
          <h1 className="text-3xl font-bold mb-8">Welcome, {session.user.firstName}</h1>
          <div className="space-y-6">
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Your Dashboard</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Student Number:</h3>
                  <p className="text-gray-600">{session.user.id}</p>
                </div>
                <div>
                  <h3 className="font-medium">Role:</h3>
                  <p className="text-gray-600">{session.user.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
