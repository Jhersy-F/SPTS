import React from 'react';
import InstructorRegister from '@/components/auth/InstructorRegister';
import Link from 'next/link';

export default function InstructorRegisterPage() {
  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-16 ">
        <div className="max-w-md mx-auto bg-white shadow-lg p-8 light-border background-light800_dark200 min-w-full rounded-[10px] border">
          <InstructorRegister />
          <div className="text-center text-sm text-gray-600 mt-6">
            <span>Already have an account? </span>
            <Link href="/login/instructor" className="text-blue-600 hover:underline">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
