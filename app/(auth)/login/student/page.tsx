import React from 'react';
import StudentLogin from '@/components/auth/StudentLogin';
import Link from 'next/link';

export default function StudentLoginPage() {
  return (
    <div className="min-h-screen  ">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white shadow-lg p-8 light-border background-light800_dark200 min-w-full rounded-[10px] border">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-center mb-8">Student Login</h1>
            <StudentLogin />
            <div className="text-center text-sm text-gray-600">
              <span>Don&apos;t have an account? </span>
              <Link href="/register" className="text-blue-600 hover:underline">Register</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
