'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UpdateData {
  firstName: string;
  lastName: string;
  username: string;
  currentPassword?: string;
  newPassword?: string;
}

export default function InstructorProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login/instructor');
      return;
    }

    if (session?.user?.role !== 'instructor') {
      return;
    }

    // Load current profile data from API
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/instructor/profile', { cache: 'no-store' });
        const data = await res.json();
        if (res.ok && data.instructor) {
          setFormData((prev) => ({
            ...prev,
            firstName: data.instructor.firstName || '',
            lastName: data.instructor.lastName || '',
            username: data.instructor.username || '',
          }));
        }
      } catch (e) {
        // ignore for now
      }
    };

    loadProfile();
  }, [session, status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Validate password confirmation if changing password
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setIsLoading(false);
      return;
    }

    try {
      const updatePayload: UpdateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
      };

      if (formData.newPassword) {
        if (!formData.currentPassword) {
          setMessage({ type: 'error', text: 'Current password is required to change password' });
          setIsLoading(false);
          return;
        }
        updatePayload.currentPassword = formData.currentPassword;
        updatePayload.newPassword = formData.newPassword;
      }

      const response = await fetch('/api/instructor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Update session with new basic info available in session model
        await update({
          ...session,
          user: {
            ...session?.user,
            firstName: formData.firstName,
            name: `${formData.firstName} ${formData.lastName}`,
          },
        });
        // Clear password fields
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred while updating profile' });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'instructor') {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Instructor Profile</h1>
        <p className="text-gray-600 mt-2">Update your personal information and password</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-md border ${message.type === 'error' ? 'border-red-500 bg-red-50 text-red-700' : 'border-green-500 bg-green-50 text-green-700'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
            <p className="text-sm text-gray-600">Update your basic profile information</p>
          </div>
          <div className="px-6 py-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleInputChange} required placeholder="Enter your first name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleInputChange} required placeholder="Enter your last name" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" type="text" value={formData.username} onChange={handleInputChange} required placeholder="Enter your username" />
              </div>
            </form>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
            <p className="text-sm text-gray-600">Leave password fields empty if you don't want to change your password</p>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" name="currentPassword" type="password" value={formData.currentPassword} onChange={handleInputChange} placeholder="Enter your current password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" name="newPassword" type="password" value={formData.newPassword} onChange={handleInputChange} placeholder="Enter your new password" minLength={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm your new password" minLength={6} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" onClick={handleSubmit} disabled={isLoading} className="min-w-32">
            {isLoading ? 'Updating...' : 'Update Profile'}
          </Button>
        </div>
      </div>
    </div>
  );
}
