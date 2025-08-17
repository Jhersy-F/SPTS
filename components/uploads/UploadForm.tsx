'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['quiz', 'activity', 'exam'], {
    required_error: 'Type is required',
  }),
  instructorID: z.string().min(1, 'Instructor is required'),
  subject: z.string().min(1, 'Subject is required'),
  // Make optional so RHF/Zod doesn't block onSubmit; we'll validate manually
  file: z.custom<File | undefined | null>(() => true).optional(),
});
 
 type UploadFormProps = {
   onSuccess?: () => void;
   onCancel?: () => void;
 };
 
type Instructor = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
};

export default function UploadForm({ onSuccess, onCancel }: UploadFormProps) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loadingInstructors, setLoadingInstructors] = useState(true);


  type FormData = z.infer<typeof uploadSchema>;

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { 
      title: '', 
      description: '', 
      type: undefined,
      instructorID: '', 
      subject: '', 
      file: undefined 
    },
  });

  // Load instructors on component mount
  useEffect(() => {
    const loadInstructors = async () => {
      try {
        const response = await fetch('/api/instructors');
        const data = await response.json();
        if (response.ok) {
          setInstructors(data.instructors || []);
        } else {
          console.error('Failed to load instructors:', data.error);
        }
      } catch (error) {
        console.error('Error loading instructors:', error);
      } finally {
        setLoadingInstructors(false);
      }
    };
    loadInstructors();
  }, []);

  const selectedFile = watch('file');

  async function onSubmit(data: z.infer<typeof uploadSchema>) {
    try {
      setError('');
      setSubmitting(true);
      let fileToSend: File | null = localFile ?? (data.file instanceof File ? data.file : null);
      if (!fileToSend) {
        // Fallback: read directly from the input element
        const el = document.querySelector('input[type="file"][name="file"]') as HTMLInputElement | null;
        const picked = el?.files?.[0] || null;
        if (picked) fileToSend = picked;
      }
      if (!fileToSend) {
        setError('Please choose a file to upload.');
        return;
      }

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('type', data.type);
      formData.append('instructorID', data.instructorID);
      formData.append('subject', data.subject);
      formData.append('file', fileToSend);

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || 'Upload failed');
      }

      setSuccess(true);
      // Notify parent so it can refresh list and/or hide the form
      onSuccess?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Upload Successful!</h2>
        <p className="mb-4">Your document has been uploaded successfully.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Upload Document</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            {...register('title')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            {...register('description')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            {...register('type')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a type</option>
            <option value="quiz">Quiz</option>
            <option value="activity">Activity</option>
            <option value="exam">Exam</option>
          </select>
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Instructor</label>
          <select
            {...register('instructorID')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loadingInstructors}
          >
            <option value="">Select an instructor</option>
            {instructors.map((instructor) => (
              <option key={instructor.id} value={String(instructor.id)}>
                {instructor.firstName} {instructor.lastName} 
              </option>
            ))}
          </select>
          {errors.instructorID && (
            <p className="text-red-500 text-sm mt-1">{errors.instructorID.message}</p>
          )}
          {loadingInstructors && (
            <p className="text-gray-500 text-sm mt-1">Loading instructors...</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <select
            {...register('subject')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a subject</option>
            <option value="subject1">Subject 1</option>
            <option value="subject2">Subject 2</option>
          </select>
          {errors.subject && (
            <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="upload-file" className="block text-sm font-medium mb-1">File</label>
          <Controller
            name="file"
            control={control}
            render={({ field }) => (
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                name={field.name}
                id="upload-file"
                ref={field.ref}
                onBlur={field.onBlur}
                multiple={false}
                onChange={(e) => {
                  const f = (e.target as HTMLInputElement).files?.[0] || null;
                  // Store only the File object in form state
                  field.onChange(f);
                  setLocalFile(f);
                }}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
          {selectedFile instanceof File && (
            <p className="text-xs text-gray-600 mt-1">Selected: {selectedFile.name}</p>
          )}
          {errors.file && (
            <p className="text-red-500 text-sm mt-1">{errors.file.message as string}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 disabled:bg-blue-300 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {submitting ? 'Uploading…' : 'Upload Document'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
