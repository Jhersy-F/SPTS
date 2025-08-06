import React from 'react';
import StudentRegister from '@/components/auth/StudentRegister';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <StudentRegister />
        </div>
      </div>
    </div>
  );
}
