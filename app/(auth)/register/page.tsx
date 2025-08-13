import React from 'react';
import StudentRegister from '@/components/auth/StudentRegister';

export default function RegisterPage() {
  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-16 ">
        <div className="max-w-md mx-auto bg-white shadow-lg p-8 light-border background-light800_dark200 min-w-full rounded-[10px] border">
          <StudentRegister />
        </div>
      </div>
    </div>
  );
}
