import React from 'react';
import InstructorLogin from '@/components/auth/InstructorLogin';
import Link from 'next/link';

export default function InstructorLoginPage() {
  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-center mb-8">Instructor Login</h1>
            <InstructorLogin />
            <div className="text-center text-sm text-gray-600">
              <span>Don&apos;t have an account? </span>
              <Link href="/register/instructor" className="text-blue-600 hover:underline">Register</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
