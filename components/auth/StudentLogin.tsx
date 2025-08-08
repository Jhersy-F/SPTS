'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn } from 'next-auth/react';

type LoginFormData = z.infer<typeof loginSchema>;

const loginSchema = z.object({
  studentNumber: z.string().min(1, 'Student number is required'),
  password: z.string().min(1, 'Password is required'),
});

export default function StudentLogin() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setError('');
    // Use NextAuth credentials provider so server can read the session
    const res = await signIn('student-credentials', {
      redirect: false,
      studentNumber: data.studentNumber,
      password: data.password,
      // You can set callbackUrl here if you want automatic redirect
    });

    if (res?.error) {
      setError('Login failed. Please check your credentials.');
      return;
    }

    setSuccess(true);
    router.push('/dashboard');
  }

  if (success) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Login Successful!</h2>
        <p className="mb-4">You will be redirected to your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Student Login</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Student Number</label>
          <input
            type="text"
            {...register('studentNumber')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.studentNumber?.message && (
            <div className="text-red-500 text-sm mt-1">
              {errors.studentNumber.message}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            {...register('password')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.password?.message && (
            <div className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Login
        </button>
      </form>
    </div>
  );
}
